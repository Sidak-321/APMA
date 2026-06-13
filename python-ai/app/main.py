import json
import os
from flask import Flask, jsonify, request, Response, stream_with_context
from app.rag.parser import parse_file
from app.rag.chunker import chunk_text
from app.rag.embedder import embed_and_store
from app.agents.graph import agent_graph

app = Flask(__name__)


def sse_event(event_type: str, node: str, content) -> str:
    data = json.dumps({"type": event_type, "node": node, "content": content})
    return f"data: {data}\n\n"


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "python-ai"})


@app.post("/embed")
def embed():
    data = request.get_json()

    required = ["document_id", "project_id", "user_id", "file_base64", "file_type"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        text = parse_file(data["file_base64"], data["file_type"])
        chunks = chunk_text(text)

        if not chunks:
            return jsonify({"error": "No text extracted from document"}), 422

        chunk_count = embed_and_store(
            chunks=chunks,
            document_id=data["document_id"],
            project_id=data["project_id"],
            user_id=data["user_id"],
        )

        return jsonify({"status": "ok", "chunk_count": chunk_count})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Embed error: {e}", flush=True)
        return jsonify({"error": "Internal error during embedding"}), 500


@app.post("/run-agent")
def run_agent():
    data = request.get_json()

    required = ["goal", "project_id", "user_id", "output_type"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    initial_state = {
        "goal": data["goal"],
        "project_id": data["project_id"],
        "user_id": data["user_id"],
        "output_type": data.get("output_type", "prd"),
        "sub_tasks": [],
        "research": [],
        "analysis": "",
        "confidence_score": 0.0,
        "reasoning_chain": "",
        "output_json": {},
        "guardrails_passed": False,
        "iteration": 0,
        "langsmith_run_id": "",
        "tokens_used": 0,
        "error": "",
    }

    def generate():
        try:
            yield sse_event("start", "graph", "Agent started")

            for event in agent_graph.stream(initial_state):
                for node_name, node_output in event.items():
                    if node_name == "planner":
                        yield sse_event("node_complete", "planner", {
                            "sub_tasks": node_output.get("sub_tasks", [])
                        })
                    elif node_name == "researcher":
                        yield sse_event("node_complete", "researcher", {
                            "research_count": len(node_output.get("research", []))
                        })
                    elif node_name == "analyzer":
                        yield sse_event("node_complete", "analyzer", {
                            "confidence_score": node_output.get("confidence_score", 0),
                            "analysis_preview": str(node_output.get("analysis", ""))[:200],
                        })
                    elif node_name == "generator":
                        yield sse_event("node_complete", "generator", {
                            "guardrails_passed": node_output.get("guardrails_passed", False),
                            "tokens_used": node_output.get("tokens_used", 0),
                        })
                        yield sse_event("complete", "graph", {
                            "output_json": node_output.get("output_json", {}),
                            "guardrails_passed": node_output.get("guardrails_passed", False),
                            "tokens_used": node_output.get("tokens_used", 0),
                        })

        except Exception as e:
            print(f"Agent error: {e}", flush=True)
            yield sse_event("error", "graph", str(e))

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
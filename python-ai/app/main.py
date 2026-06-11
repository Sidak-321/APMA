from flask import Flask, jsonify, request
from app.rag.parser import parse_file
from app.rag.chunker import chunk_text
from app.rag.embedder import embed_and_store

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "python-ai"})


@app.post("/embed")
def embed():
    data = request.get_json()

    required = ["document_id", "project_id", "user_id", "file_path", "file_type"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        text = parse_file(data["file_path"], data["file_type"])
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
    return jsonify({"status": "not_implemented", "phase": 3}), 501


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
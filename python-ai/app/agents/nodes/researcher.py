import os
from tavily import TavilyClient
from app.agents.state import AgentState
from app.rag.retriever import retrieve

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def researcher_node(state: AgentState) -> dict:
    print(f"[Researcher] Running {len(state['sub_tasks'])} sub-tasks", flush=True)
    research = []

    for sub_task in state["sub_tasks"]:
        result = {"sub_task": sub_task, "qdrant_chunks": [], "tavily_results": []}

        # RAG retrieval from uploaded documents
        try:
            chunks = retrieve(
                query=sub_task,
                project_id=state["project_id"],
                user_id=state["user_id"],
                top_k=3,
            )
            result["qdrant_chunks"] = chunks
            print(f"[Researcher] RAG found {len(chunks)} chunks for: {sub_task}", flush=True)
        except Exception as e:
            print(f"[Researcher] RAG error: {e}", flush=True)

        # Tavily web search
        try:
            tavily_response = tavily.search(
                query=sub_task,
                max_results=3,
                search_depth="basic",
            )
            result["tavily_results"] = [
                {"title": r.get("title"), "content": r.get("content"), "url": r.get("url")}
                for r in tavily_response.get("results", [])
            ]
            print(f"[Researcher] Tavily found {len(result['tavily_results'])} results", flush=True)
        except Exception as e:
            print(f"[Researcher] Tavily error: {e}", flush=True)

        research.append(result)

    return {"research": research}
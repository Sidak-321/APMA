from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes.planner import planner_node
from app.agents.nodes.researcher import researcher_node
from app.agents.nodes.analyzer import analyzer_node
from app.agents.nodes.generator import generator_node


def should_retry(state: AgentState) -> str:
    """
    Confidence check edge.
    If score < 0.85 AND iterations < 3 → retry researcher.
    Otherwise → generator.
    """
    score = state.get("confidence_score", 0)
    iteration = state.get("iteration", 0)

    if score < 0.85 and iteration < 3:
        print(f"[Graph] Confidence {score} < 0.85, retrying (iteration {iteration})", flush=True)
        return "retry"
    else:
        print(f"[Graph] Confidence {score} sufficient, proceeding to generator", flush=True)
        return "generate"


def increment_iteration(state: AgentState) -> dict:
    return {"iteration": state.get("iteration", 0) + 1}


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("planner", planner_node)
    graph.add_node("researcher", researcher_node)
    graph.add_node("increment", increment_iteration)
    graph.add_node("analyzer", analyzer_node)
    graph.add_node("generator", generator_node)

    graph.set_entry_point("planner")

    graph.add_edge("planner", "researcher")
    graph.add_edge("researcher", "analyzer")

    # Conditional edge — retry or generate
    graph.add_conditional_edges(
        "analyzer",
        should_retry,
        {
            "retry": "increment",
            "generate": "generator",
        }
    )

    graph.add_edge("increment", "researcher")
    graph.add_edge("generator", END)

    return graph.compile()


# Build once at module level
agent_graph = build_graph()
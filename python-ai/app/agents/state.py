from typing import TypedDict, Annotated
import operator


class AgentState(TypedDict):
    # Input
    goal: str
    project_id: str
    user_id: str
    output_type: str  # "prd" | "roadmap" | "brief"

    # Planner output
    sub_tasks: list[str]

    # Researcher output
    research: list[dict]  # [{sub_task, qdrant_chunks, tavily_results}]

    # Analyzer output
    analysis: str
    confidence_score: float
    reasoning_chain: str

    # Generator output
    output_json: dict
    guardrails_passed: bool

    # Meta
    iteration: int
    langsmith_run_id: str
    tokens_used: int
    error: str
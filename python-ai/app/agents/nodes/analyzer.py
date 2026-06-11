import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.agents.state import AgentState
import json

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2,
)


def _format_research(research: list[dict]) -> str:
    parts = []
    for r in research:
        parts.append(f"Sub-task: {r['sub_task']}")
        for chunk in r.get("qdrant_chunks", []):
            parts.append(f"  [Document] {chunk['text'][:300]}")
        for result in r.get("tavily_results", []):
            parts.append(f"  [Web] {result['title']}: {result['content'][:300]}")
    return "\n".join(parts)


def analyzer_node(state: AgentState) -> dict:
    print(f"[Analyzer] Analyzing research (iteration {state.get('iteration', 0)})", flush=True)

    research_text = _format_research(state["research"])

    system_prompt = """You are a senior product analyst.
Analyze the research and produce a structured analysis.
Respond ONLY with valid JSON in this exact format:
{
  "analysis": "detailed analysis text here",
  "confidence_score": 0.87,
  "reasoning_chain": "step by step reasoning here",
  "gaps": ["gap1", "gap2"]
}
confidence_score must be a float between 0 and 1.
Higher score means the research is sufficient to produce high quality output."""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Goal: {state['goal']}\n\nResearch:\n{research_text}"),
    ])

    try:
        content = response.content.strip().strip("```json").strip("```").strip()
        result = json.loads(content)
        confidence_score = float(result.get("confidence_score", 0.5))
        analysis = result.get("analysis", "")
        reasoning_chain = result.get("reasoning_chain", "")
    except Exception as e:
        print(f"[Analyzer] Parse error: {e}", flush=True)
        confidence_score = 0.5
        analysis = response.content
        reasoning_chain = "Parse error — using raw response"

    print(f"[Analyzer] Confidence score: {confidence_score}", flush=True)
    return {
        "analysis": analysis,
        "confidence_score": confidence_score,
        "reasoning_chain": reasoning_chain,
    }
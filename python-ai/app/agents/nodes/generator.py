import os
import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.agents.state import AgentState
from app.guardrails.validators import validate_output

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
)

PRD_PROMPT = """You are a senior product manager writing a PRD.
Based on the analysis provided, generate a complete PRD.
Respond ONLY with valid JSON matching this exact structure:
{
  "title": "PRD title",
  "overview": "detailed product overview (min 50 chars)",
  "problem_statement": "the problem being solved (min 30 chars)",
  "goals": ["goal1", "goal2", "goal3"],
  "user_stories": ["As a user I want...", "..."],
  "requirements": ["requirement1", "requirement2"],
  "success_metrics": ["metric1", "metric2"],
  "risks": ["risk1", "risk2"]
}"""

ROADMAP_PROMPT = """Generate a product roadmap as JSON:
{
  "title": "roadmap title",
  "phases": [{"name": "Phase 1", "items": ["item1"], "duration": "2 weeks"}],
  "timeline": "overall timeline",
  "milestones": ["milestone1", "milestone2"]
}"""

BRIEF_PROMPT = """Generate a product brief as JSON:
{
  "title": "brief title",
  "summary": "executive summary (min 50 chars)",
  "key_points": ["point1", "point2"],
  "next_steps": ["step1", "step2"]
}"""

PROMPT_MAP = {"prd": PRD_PROMPT, "roadmap": ROADMAP_PROMPT, "brief": BRIEF_PROMPT}


def generator_node(state: AgentState) -> dict:
    print(f"[Generator] Generating {state['output_type']}", flush=True)

    system_prompt = PROMPT_MAP.get(state["output_type"], PRD_PROMPT)

    context = f"""Goal: {state['goal']}
Analysis: {state['analysis']}
Reasoning: {state['reasoning_chain']}"""

    max_retries = 3
    last_error = ""

    for attempt in range(max_retries):
        try:
            messages = [SystemMessage(content=system_prompt), HumanMessage(content=context)]
            if last_error:
                messages.append(HumanMessage(
                    content=f"Previous attempt failed validation: {last_error}. Please fix and retry."
                ))

            response = llm.invoke(messages)
            content = response.content.strip().strip("```json").strip("```").strip()
            data = json.loads(content)

            passed, error, validated = validate_output(state["output_type"], data)

            if passed:
                print(f"[Generator] Validation passed on attempt {attempt + 1}", flush=True)
                return {
                    "output_json": validated,
                    "guardrails_passed": True,
                    "tokens_used": response.response_metadata.get("usage", {}).get("total_tokens", 0),
                }
            else:
                print(f"[Generator] Validation failed: {error}", flush=True)
                last_error = error

        except Exception as e:
            print(f"[Generator] Attempt {attempt + 1} error: {e}", flush=True)
            last_error = str(e)

    # All retries exhausted — return raw output with guardrails_passed=False
    print("[Generator] All retries exhausted, returning unvalidated output", flush=True)
    return {
        "output_json": {"raw": response.content if 'response' in dir() else "generation failed"},
        "guardrails_passed": False,
        "tokens_used": 0,
    }
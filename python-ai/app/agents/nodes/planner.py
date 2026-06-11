import json
import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.agents.state import AgentState

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,
)


def planner_node(state: AgentState) -> dict:
    print(f"[Planner] Planning for goal: {state['goal']}", flush=True)

    system_prompt = """You are a product manager planning agent.
Given a goal, break it down into 3-5 specific research sub-tasks.
Respond ONLY with a valid JSON array of strings. No explanation, no markdown.
Example: ["Research market size", "Analyze competitor features", "Define user personas"]"""

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Goal: {state['goal']}\nOutput type: {state['output_type']}"),
    ])

    try:
        # Strip any accidental markdown fences
        content = response.content.strip().strip("```json").strip("```").strip()
        sub_tasks = json.loads(content)
        if not isinstance(sub_tasks, list):
            raise ValueError("Expected a list")
    except Exception as e:
        print(f"[Planner] Parse error: {e}, using fallback", flush=True)
        sub_tasks = [
            f"Research background for: {state['goal']}",
            f"Identify key requirements for: {state['goal']}",
            f"Analyze risks for: {state['goal']}",
        ]

    print(f"[Planner] Sub-tasks: {sub_tasks}", flush=True)
    return {"sub_tasks": sub_tasks, "iteration": 0}
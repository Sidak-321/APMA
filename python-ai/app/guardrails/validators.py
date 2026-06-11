from pydantic import BaseModel, Field
from typing import Optional


class PRDOutput(BaseModel):
    title: str = Field(..., min_length=1, description="PRD title")
    overview: str = Field(..., min_length=50, description="Product overview")
    problem_statement: str = Field(..., min_length=30, description="Problem being solved")
    goals: list[str] = Field(..., min_items=1, description="Product goals")
    user_stories: list[str] = Field(..., min_items=1, description="User stories")
    requirements: list[str] = Field(..., min_items=1, description="Functional requirements")
    success_metrics: list[str] = Field(..., min_items=1, description="Success metrics")
    risks: Optional[list[str]] = Field(default=[], description="Known risks")


class RoadmapOutput(BaseModel):
    title: str = Field(..., min_length=1)
    phases: list[dict] = Field(..., min_items=1)
    timeline: str = Field(..., min_length=1)
    milestones: list[str] = Field(..., min_items=1)


class BriefOutput(BaseModel):
    title: str = Field(..., min_length=1)
    summary: str = Field(..., min_length=50)
    key_points: list[str] = Field(..., min_items=1)
    next_steps: list[str] = Field(..., min_items=1)


def validate_output(output_type: str, data: dict) -> tuple[bool, str, dict]:
    """
    Validate output against Pydantic schema.
    Returns (passed, error_message, validated_data)
    """
    schema_map = {
        "prd": PRDOutput,
        "roadmap": RoadmapOutput,
        "brief": BriefOutput,
    }

    schema = schema_map.get(output_type)
    if not schema:
        return False, f"Unknown output type: {output_type}", {}

    # Check for PII — basic check for email/phone patterns
    import re
    text = str(data)
    pii_patterns = [
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # email
        r'\b\d{10}\b',  # phone
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
    ]
    for pattern in pii_patterns:
        if re.search(pattern, text):
            return False, "PII detected in output", {}

    try:
        validated = schema(**data)
        return True, "", validated.model_dump()
    except Exception as e:
        return False, str(e), {}
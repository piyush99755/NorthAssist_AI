from typing import Literal

from pydantic import BaseModel, Field

from app.models.life_event import RecommendedProgram


class CaseMessageRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's situation or follow-up answer.",
    )
    selected_benefit_id: str | None = Field(
        default=None,
        description="Stable catalog ID for the benefit card the user selected.",
    )


CaseResponseType = Literal[
    "benefit_cards",
    "follow_up_question",
    "eligibility_placeholder",
    "case_reset_required",
    "clarification",
]


class CaseResponse(BaseModel):
    thread_id: str
    response_type: CaseResponseType
    response: str
    message_history: list[str]
    city: str | None = None
    employment_status: str | None = None
    missing_fields: list[str]
    benefit_matches: list[RecommendedProgram]
    selected_benefit_id: str | None = None
    extraction_method: str | None = None
    extraction_warning: str | None = None

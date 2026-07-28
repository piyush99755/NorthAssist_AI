from pydantic import BaseModel, Field
from app.models.life_event import RecommendedProgram

class CaseMessageRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's situation or follow-up answer.",
    )
    
class CaseResponse(BaseModel):
    thread_id: str
    response: str
    message_history: list[str]
    city: str | None = None
    employment_status: str | None = None
    missing_fields: list[str]
    benefit_matches: list[RecommendedProgram]
    extraction_method: str | None = None
    extraction_warning: str | None = None
    
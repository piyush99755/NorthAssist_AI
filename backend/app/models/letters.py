from pydantic import BaseModel, Field


class LetterExplainRequest(BaseModel):
    letter_text: str = Field(..., min_length=1, description="Full or partial text of the government letter")
    letter_type: str | None = Field(default=None, description="Optional hint: ODSP, EI, CRA, Housing")


class LetterExplainResponse(BaseModel):
    summary: str
    key_points: list[str]
    action_items: list[str]
    deadlines: list[str]

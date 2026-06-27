from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    age: int | None = Field(default=None, ge=0, le=120)
    household_size: int | None = Field(default=None, ge=1)
    employment_status: str | None = None


class LifeEventAnalyzeRequest(BaseModel):
    life_event: str = Field(..., min_length=1, description="Description of the life event or situation")
    location: str | None = Field(default=None, description="City or region in Northern Ontario")
    profile: UserProfile | None = None


class RecommendedProgram(BaseModel):
    name: str
    description: str
    eligibility: str
    url: str


class LifeEventAnalyzeResponse(BaseModel):
    life_event: str
    summary: str
    recommended_programs: list[RecommendedProgram]

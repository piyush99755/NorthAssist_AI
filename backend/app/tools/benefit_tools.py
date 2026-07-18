from langchain.tools import tool
from pydantic import BaseModel, Field

from app.models.life_event import LifeEventAnalyzeRequest, UserProfile
from app.services.life_event_service import analyze_life_event


class BenefitSearchInput(BaseModel):
    life_event: str = Field(
        min_length=1,
        description="The user's situation, such as job loss or housing difficulty.",
    )
    location: str | None = Field(
        default=None,
        description="The user's Northern Ontario city.",
    )
    employment_status: str | None = Field(
        default=None,
        description="The user's current employment status.",
    )


@tool(args_schema=BenefitSearchInput)
def search_benefit_catalog(
    life_event: str,
    location: str | None = None,
    employment_status: str | None = None,
) -> dict:
    """Search the trusted NorthAssist benefit catalog for relevant programs."""
    profile = UserProfile(
        employment_status=employment_status,
    )

    request = LifeEventAnalyzeRequest(
        life_event=life_event,
        location=location,
        profile=profile,
    )

    result = analyze_life_event(request)

    return result.model_dump()

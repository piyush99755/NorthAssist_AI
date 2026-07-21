from typing import Literal
from pydantic import Field, BaseModel, ConfigDict


EmploymentStatus = Literal[
    "employed",
    "unemployed",
    "self-employed",
    "student",
    "retired",
    "disabled",
]

ExtractionMethod = Literal[
    "ollama",
    "deterministic"
]


class ExtractedCase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    
    city: str | None = Field(
        default=None,
        description=(
            "The Northern Ontario city explicitly mentioned by the user. "
            "Return null if no city is provided."
        ),
    )

    employment_status: EmploymentStatus | None = Field(
        default=None,
        description=(
            "The user's current employment status. "
            "Infer unemployed from language such as laid off, "
            "lost their job, or no longer working. "
            "Return null when the status cannot be determined."
        ),
    )
    
    
class CaseExtractionResult(ExtractedCase):
    extraction_method: ExtractionMethod
    
    warning: str | None = None
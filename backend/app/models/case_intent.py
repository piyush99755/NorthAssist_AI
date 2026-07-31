from typing import Literal

from pydantic import ConfigDict, BaseModel, Field

CaseIntentType = Literal[
    "provide_case_information",
    "ask_eligibility_question",
    "start_new_case",
    "other",
]

IntentClassificationMethod = Literal[
    "ollama",
    "deterministic",
]


class CaseIntent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    intent: CaseIntentType = Field(
        description="The action represented by the user's latest message."
    )

    subject: str | None = Field(
        default=None,
        description=(
            "The status, circumstance, or topic mentioned by the user, "
            "such as international student or refugee claimant."
        ),
    )

    referenced_programs: list[str] = Field(
        default_factory=list,
        description=(
            "Benefit programs explicitly named by the user or unambiguously "
            "referenced through conversation context."
        ),
    )


class CaseIntentResult(CaseIntent):
    classification_method: IntentClassificationMethod
    warning: str | None = None


import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama

from app.models.case_intent import CaseIntent, CaseIntentResult

DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen3:4b-instruct"

SYSTEM_PROMPT = """
You classify the intent of the user's latest message for NorthAssist AI.

Allowed intents:

1. provide_case_information
The user provides or corrects personal case information, such as their
city, employment situation, student status, immigration status, age,
disability, dependants, or housing situation.

2. ask_eligibility_question
The user asks whether a benefit or previously recommended program applies
to a person, status, or circumstance. Questions using words such as
"this", "that", "these", or "those" may refer to previously recommended
programs in the conversation.

3. start_new_case
The user explicitly asks to clear, restart, or discuss a different case.

4. other
The message does not fit the categories above.

Rules:
- Classify the latest message, using conversation history only as context.
- Do not answer the user's question.
- Do not invent program names.
- Put a status or circumstance such as "international student" or
  "refugee claimant" in subject.
- Add benefit programs explicitly named in the latest message or
  unambiguously referenced through conversation context.
""".strip()

RESTART_PHRASES = [
    "start over",
    "start again",
    "new case",
    "different situation",
    "clear my case",
    "reset",
]

ELIGIBILITY_PHRASES = [
    "eligible",
    "eligibility",
    "qualify",
    "apply to",
    "apply for",
    "work for",
    "available to",
    "receive",
]

CASE_INFORMATION_PHRASES = [
    "sudbury",
    "thunder bay",
    "timmins",
    "north bay",
    "sault ste. marie",
    "employed",
    "unemployed",
    "laid off",
    "lost my job",
    "student",
    "refugee",
    "newcomer",
    "disability",
    "disabled",
    "dependant",
    "dependent",
    "housing",
]

def classify_case_intent_with_ollama(
    latest_message: str,
    conversation_history: list[str] | None = None,
) -> CaseIntent:
    model = ChatOllama(
        model=os.getenv("OLLAMA_MODEL", DEFAULT_MODEL),
        base_url=os.getenv("OLLAMA_BASE_URL", DEFAULT_BASE_URL),
        temperature=0,
    )

    structured_model = model.with_structured_output(
        CaseIntent,
        method="json_schema",
    )

    history = conversation_history or []
    history_text = "\n".join(history)

    user_prompt = (
        f"Conversation history:\n{history_text or '(none)'}\n\n"
        f"Latest message:\n{latest_message}"
    )

    result = structured_model.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]
    )

    if not isinstance(result, CaseIntent):
        raise TypeError("Ollama returned an unexpected intent type.")

    return result


def classify_case_intent_deterministically(
    latest_message: str,
) -> CaseIntent:
    message = latest_message.lower()

    if any(phrase in message for phrase in RESTART_PHRASES):
        intent = "start_new_case"
    elif any(phrase in message for phrase in ELIGIBILITY_PHRASES):
        intent = "ask_eligibility_question"
    elif any(phrase in message for phrase in CASE_INFORMATION_PHRASES):
        intent = "provide_case_information"
    else:
        intent = "other"

    return CaseIntent(
        intent=intent,
        subject=None,
        referenced_programs=[],
    )


def classify_case_intent(
    latest_message: str,
    conversation_history: list[str] | None = None,
    prefer_ollama: bool = True,
) -> CaseIntentResult:
    if prefer_ollama:
        try:
            classified = classify_case_intent_with_ollama(
                latest_message=latest_message,
                conversation_history=conversation_history,
            )

            return CaseIntentResult(
                **classified.model_dump(),
                classification_method="ollama",
            )
        except Exception as error:
            warning = (
                "Local AI intent classification failed; "
                "deterministic fallback used. "
                f"Error type: {type(error).__name__}."
            )
    else:
        warning = (
            "Local AI intent classification disabled; "
            "deterministic fallback used."
        )

    classified = classify_case_intent_deterministically(latest_message)

    return CaseIntentResult(
        **classified.model_dump(),
        classification_method="deterministic",
        warning=warning,
    )

import json
from pathlib import Path

from app.models.letters import LetterExplainRequest, LetterExplainResponse
from app.services.openai_client import chat_completion_json

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_letters.json"


def _load_sample_letters() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _match_sample_letter(letter_text: str, letter_type: str | None) -> dict | None:
    text_lower = letter_text.lower()

    if letter_type:
        type_upper = letter_type.upper()
        for sample in _load_sample_letters():
            if sample["letter_type"].upper() == type_upper:
                return sample

    for sample in _load_sample_letters():
        for pattern in sample.get("match_patterns", []):
            if pattern.lower() in text_lower:
                return sample

    return None


def _generic_explanation(letter_text: str) -> LetterExplainResponse:
    preview = letter_text[:200].strip()
    if len(letter_text) > 200:
        preview += "..."

    return LetterExplainResponse(
        summary=(
            "This appears to be an official government letter. We could not match it to a "
            "known template, but you should review it carefully for any decisions, amounts, "
            "or deadlines."
        ),
        key_points=[
            f"Letter excerpt: \"{preview}\"",
            "Look for a reference number, decision date, and the issuing department.",
            "Official letters often include instructions on how to respond or appeal.",
        ],
        action_items=[
            "Identify who sent the letter and what decision or request it contains.",
            "Note any deadlines and mark them on your calendar.",
            "Contact the issuing office or call 211 Ontario if you need help understanding it.",
        ],
        deadlines=[
            "Check the letter for any response or appeal deadlines — these are usually near the bottom.",
        ],
    )


def explain_letter(request: LetterExplainRequest) -> LetterExplainResponse:
    matched = _match_sample_letter(request.letter_text, request.letter_type)
    if matched:
        return LetterExplainResponse(
            summary=matched["summary"],
            key_points=matched["key_points"],
            action_items=matched["action_items"],
            deadlines=matched["deadlines"],
        )

    ai_result = chat_completion_json(
        system_prompt=(
            "You are a plain-language document explainer for Northern Ontario residents. "
            "Analyze the government letter and respond with valid JSON only, using this schema: "
            '{"summary": "string", "key_points": ["string"], "action_items": ["string"], "deadlines": ["string"]}. '
            "Use simple language. Do not invent facts not supported by the letter text."
        ),
        user_prompt=f"Explain this government letter:\n\n{request.letter_text}",
    )
    if ai_result and "summary" in ai_result:
        return LetterExplainResponse(
            summary=ai_result.get("summary", ""),
            key_points=ai_result.get("key_points", []),
            action_items=ai_result.get("action_items", []),
            deadlines=ai_result.get("deadlines", []),
        )

    return _generic_explanation(request.letter_text)

import json
from pathlib import Path

from app.models.life_event import (
    LifeEventAnalyzeRequest,
    LifeEventAnalyzeResponse,
    RecommendedProgram,
    UserProfile,
)
from app.services.openai_client import chat_completion

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "benefits.json"


def _load_benefits() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _score_benefit(benefit: dict, life_event_lower: str, profile: UserProfile | None) -> int:
    score = 0
    for keyword in benefit.get("keywords", []):
        if keyword.lower() in life_event_lower:
            score += 2

    if profile and profile.employment_status:
        status = profile.employment_status.lower()
        if status in ("unemployed", "jobless") and benefit["id"] in ("ei-regular", "ow"):
            score += 3
        if status == "disabled" and benefit["id"] == "odsp":
            score += 3

    return score


def _build_summary(
    life_event: str,
    programs: list[RecommendedProgram],
    location: str | None,
) -> str:
    location_text = f" in {location}" if location else " in Northern Ontario"
    if not programs:
        return (
            f"Based on your situation ({life_event}){location_text}, we could not match "
            "specific programs from our database. Consider contacting 211 Ontario for "
            "personalized assistance."
        )

    names = ", ".join(p.name for p in programs[:3])
    return (
        f"Based on your life event{location_text}, you may be eligible for programs including "
        f"{names}. Review each program's eligibility criteria and apply as soon as possible."
    )


def analyze_life_event(request: LifeEventAnalyzeRequest) -> LifeEventAnalyzeResponse:
    benefits = _load_benefits()
    life_event_lower = request.life_event.lower()

    scored = [
        (benefit, _score_benefit(benefit, life_event_lower, request.profile))
        for benefit in benefits
    ]
    scored.sort(key=lambda item: item[1], reverse=True)

    matched = [benefit for benefit, score in scored if score > 0][:5]
    if not matched:
        matched = [benefit for benefit, _ in scored[:3]]

    programs = [
        RecommendedProgram(
            name=b["name"],
            description=b["description"],
            eligibility=b["eligibility"],
            url=b["url"],
        )
        for b in matched
    ]

    summary = _build_summary(request.life_event, programs, request.location)

    ai_summary = chat_completion(
        system_prompt=(
            "You are a helpful assistant for Northern Ontario residents navigating "
            "government benefits. Write a brief, plain-language summary (2-3 sentences) "
            "about which programs may help. Do not invent programs not in the list."
        ),
        user_prompt=(
            f"Life event: {request.life_event}\n"
            f"Location: {request.location or 'Northern Ontario'}\n"
            f"Matched programs: {[p.name for p in programs]}"
        ),
    )
    if ai_summary:
        summary = ai_summary.strip()

    return LifeEventAnalyzeResponse(
        life_event=request.life_event,
        summary=summary,
        recommended_programs=programs,
    )

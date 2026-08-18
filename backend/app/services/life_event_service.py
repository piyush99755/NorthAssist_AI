import json
import re
from pathlib import Path

from app.models.life_event import (
    LifeEventAnalyzeRequest,
    LifeEventAnalyzeResponse,
    RecommendedProgram,
    UserProfile,
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "benefits.json"


def _load_benefits() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def get_benefit_by_id(benefit_id: str) -> dict | None:
    """Return a trusted benefit-catalog record by its stable identifier."""
    return next(
        (benefit for benefit in _load_benefits() if benefit["id"] == benefit_id),
        None,
    )


def _keyword_matches(keyword: str, text: str) -> bool:
    """Match a complete word or phrase, not a substring inside another word."""
    pattern = rf"(?<!\w){re.escape(keyword.lower())}(?!\w)"
    return re.search(pattern, text) is not None


def _score_benefit(benefit: dict, life_event_lower: str, profile: UserProfile | None) -> int:
    score = 0
    for keyword in benefit.get("keywords", []):
        if _keyword_matches(keyword, life_event_lower):
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
            id=b["id"],
            name=b["name"],
            description=b["description"],
            eligibility=b["eligibility"],
            url=b["url"],
        )
        for b in matched
    ]

    summary = _build_summary(request.life_event, programs, request.location)

    return LifeEventAnalyzeResponse(
        life_event=request.life_event,
        summary=summary,
        recommended_programs=programs,
    )

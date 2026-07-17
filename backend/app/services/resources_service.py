import json
from pathlib import Path

from app.models.resources import (
    ResourceResult,
    ResourceSearchFilters,
    ResourceSearchResponse,
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "resources.json"

CATEGORY_ALIASES: dict[str, list[str]] = {
    "food": ["food", "food bank", "meal", "hunger", "groceries"],
    "housing": ["housing", "shelter", "homeless", "rent", "home"],
    "employment": ["employment", "job", "work", "career", "training"],
    "healthcare": ["healthcare", "health", "medical", "mental health", "clinic", "hospital"],
    "legal": ["legal", "law", "lawyer", "court", "tenant", "rights"],
    "support": ["support", "community", "counselling", "crisis"],
}

CITY_ALIASES: dict[str, list[str]] = {
    "sudbury": ["sudbury", "greater sudbury"],
    "thunder bay": ["thunder bay", "tbay"],
    "timmins": ["timmins"],
    "north bay": ["north bay"],
    "sault ste. marie": ["sault ste. marie", "sault ste marie", "sault", "ssm"],
}


def _load_resources() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _normalize_city(city: str) -> str:
    city_lower = city.lower().strip()
    for canonical, aliases in CITY_ALIASES.items():
        if city_lower in aliases or any(alias in city_lower for alias in aliases):
            return canonical
    return city_lower


def _category_matches(resource_category: str, filter_category: str) -> bool:
    filter_lower = filter_category.lower()
    resource_lower = resource_category.lower()

    if filter_lower == resource_lower:
        return True

    aliases = CATEGORY_ALIASES.get(filter_lower, [filter_lower])
    resource_aliases = CATEGORY_ALIASES.get(resource_lower, [resource_lower])

    return any(a in resource_aliases or a in aliases for a in aliases)


def _tokenize_query(query: str) -> list[str]:
    return [t for t in query.lower().split() if len(t) >= 2]


def _score_resource(resource: dict, tokens: list[str], city: str | None, category: str | None) -> int:
    searchable = " ".join(
        [
            resource.get("name", ""),
            resource.get("description", ""),
            resource.get("category", ""),
            resource.get("city", ""),
        ]
    ).lower()

    score = 0
    for token in tokens:
        if token in searchable:
            score += 2

    if city:
        resource_city = _normalize_city(resource.get("city", ""))
        if resource_city == city or city in resource.get("city", "").lower():
            score += 5

    if category and _category_matches(resource.get("category", ""), category):
        score += 4

    return score


def _to_results(resources: list[dict]) -> list[ResourceResult]:
    return [
        ResourceResult(
            name=r["name"],
            description=r["description"],
            category=r["category"],
            city=r["city"],
            address=r["address"],
            phone=r["phone"],
            url=r["url"],
        )
        for r in resources
    ]


def _fallback_steps(city: str | None, category: str | None) -> list[str]:
    steps = ["Call 211 Ontario (dial 2-1-1) for free, confidential local service referrals."]
    if city:
        steps.append(f"Contact your municipal office in {city.title()} for a community services directory.")
    if category:
        steps.append(f"Ask 211 specifically about {category} services in your area.")
    steps.append("Visit Ontario.ca/community for provincial program listings.")
    return steps


def search_resources(
    q: str | None = None,
    city: str | None = None,
    category: str | None = None,
) -> ResourceSearchResponse:
    all_resources = _load_resources()
    tokens = _tokenize_query(q) if q else []
    normalized_city = _normalize_city(city) if city else None

    scored = [
        (resource, _score_resource(resource, tokens, normalized_city, category))
        for resource in all_resources
    ]

    if tokens or normalized_city or category:
        matched = [r for r, score in scored if score > 0]
        matched.sort(key=lambda r: _score_resource(r, tokens, normalized_city, category), reverse=True)
    else:
        matched = list(all_resources)

    is_fallback = False
    fallback_message: str | None = None

    if not matched:
        is_fallback = True
        if normalized_city:
            matched = [r for r in all_resources if _normalize_city(r.get("city", "")) == normalized_city]
            fallback_message = f"No exact match — showing services in {city.title()}."
        if not matched and category:
            matched = [r for r in all_resources if _category_matches(r.get("category", ""), category)]
            fallback_message = f"No exact match — showing similar {category} resources across Northern Ontario."
        if not matched:
            matched = all_resources[:6]
            fallback_message = "Suggested Services Near You — curated Northern Ontario community supports."

    results = _to_results(matched[:12])

    return ResourceSearchResponse(
        query=q,
        filters=ResourceSearchFilters(city=city, category=category),
        results=results,
        total=len(results),
        is_fallback=is_fallback,
        fallback_message=fallback_message,
        suggested_next_steps=_fallback_steps(normalized_city, category) if is_fallback else [],
    )

import json
from pathlib import Path

from app.models.resources import (
    ResourceResult,
    ResourceSearchFilters,
    ResourceSearchResponse,
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "resources.json"


def _load_resources() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _matches_query(resource: dict, query: str) -> bool:
    query_lower = query.lower()
    searchable = " ".join(
        [
            resource.get("name", ""),
            resource.get("description", ""),
            resource.get("category", ""),
            resource.get("city", ""),
        ]
    ).lower()
    return query_lower in searchable


def search_resources(
    q: str | None = None,
    city: str | None = None,
    category: str | None = None,
) -> ResourceSearchResponse:
    resources = _load_resources()
    results = resources

    if q:
        results = [r for r in results if _matches_query(r, q)]

    if city:
        city_lower = city.lower()
        results = [r for r in results if city_lower in r.get("city", "").lower()]

    if category:
        category_lower = category.lower()
        results = [r for r in results if category_lower in r.get("category", "").lower()]

    resource_results = [
        ResourceResult(
            name=r["name"],
            description=r["description"],
            category=r["category"],
            city=r["city"],
            address=r["address"],
            phone=r["phone"],
            url=r["url"],
        )
        for r in results
    ]

    return ResourceSearchResponse(
        query=q,
        filters=ResourceSearchFilters(city=city, category=category),
        results=resource_results,
        total=len(resource_results),
    )

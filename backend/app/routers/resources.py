from fastapi import APIRouter, Query

from app.models.resources import ResourceSearchResponse
from app.services.resources_service import search_resources

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/search", response_model=ResourceSearchResponse)
def search(
    q: str | None = Query(default=None, description="Search term for name, description, or category"),
    city: str | None = Query(default=None, description="Filter by city"),
    category: str | None = Query(default=None, description="Filter by category (food, housing, employment, etc.)"),
) -> ResourceSearchResponse:
    return search_resources(q=q, city=city, category=category)

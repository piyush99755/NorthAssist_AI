from pydantic import BaseModel


class ResourceResult(BaseModel):
    name: str
    description: str
    category: str
    city: str
    address: str
    phone: str
    url: str


class ResourceSearchFilters(BaseModel):
    city: str | None = None
    category: str | None = None


class ResourceSearchResponse(BaseModel):
    query: str | None = None
    filters: ResourceSearchFilters
    results: list[ResourceResult]
    total: int
    is_fallback: bool = False
    fallback_message: str | None = None
    suggested_next_steps: list[str] = []

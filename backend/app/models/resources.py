from pydantic import BaseModel, Field


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

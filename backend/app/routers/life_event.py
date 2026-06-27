from fastapi import APIRouter

from app.models.life_event import LifeEventAnalyzeRequest, LifeEventAnalyzeResponse
from app.services.life_event_service import analyze_life_event

router = APIRouter(prefix="/life-event", tags=["Life Event"])


@router.post("/analyze", response_model=LifeEventAnalyzeResponse)
def analyze(request: LifeEventAnalyzeRequest) -> LifeEventAnalyzeResponse:
    return analyze_life_event(request)

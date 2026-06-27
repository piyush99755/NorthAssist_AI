from fastapi import APIRouter

from app.models.letters import LetterExplainRequest, LetterExplainResponse
from app.services.letters_service import explain_letter

router = APIRouter(prefix="/letters", tags=["Letters"])


@router.post("/explain", response_model=LetterExplainResponse)
def explain(request: LetterExplainRequest) -> LetterExplainResponse:
    return explain_letter(request)

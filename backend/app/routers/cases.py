from uuid import uuid4

from fastapi import APIRouter

from app.models.case_api import CaseMessageRequest, CaseResponse
from app.services.case_service import process_case_message


router = APIRouter(
    prefix="/cases",
    tags=["Case Navigator"],
)


@router.post(
    "",
    response_model=CaseResponse,
    status_code=201,
)
def create_case(request: CaseMessageRequest) -> CaseResponse:
    thread_id = str(uuid4())

    return process_case_message(
        thread_id=thread_id,
        message=request.message,
    )


@router.post(
    "/{thread_id}/messages",
    response_model=CaseResponse,
)
def continue_case(
    thread_id: str,
    request: CaseMessageRequest,
) -> CaseResponse:
    return process_case_message(
        thread_id=thread_id,
        message=request.message,
    )
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.case_api import CaseMessageRequest, CaseResponse
from app.services.life_event_service import get_benefit_by_id
from app.services.case_service import process_case_message


router = APIRouter(
    prefix="/cases",
    tags=["Case Navigator"],
)


def _validate_selected_benefit_id(selected_benefit_id: str | None) -> None:
    if (
        selected_benefit_id is not None
        and get_benefit_by_id(selected_benefit_id) is None
    ):
        raise HTTPException(
            status_code=422,
            detail="selected_benefit_id is not in the NorthAssist benefit catalog.",
        )


@router.post(
    "",
    response_model=CaseResponse,
    status_code=201,
)
def create_case(request: CaseMessageRequest) -> CaseResponse:
    _validate_selected_benefit_id(request.selected_benefit_id)
    thread_id = str(uuid4())

    return process_case_message(
        thread_id=thread_id,
        message=request.message,
        selected_benefit_id=request.selected_benefit_id,
    )


@router.post(
    "/{thread_id}/messages",
    response_model=CaseResponse,
)
def continue_case(
    thread_id: str,
    request: CaseMessageRequest,
) -> CaseResponse:
    _validate_selected_benefit_id(request.selected_benefit_id)

    return process_case_message(
        thread_id=thread_id,
        message=request.message,
        selected_benefit_id=request.selected_benefit_id,
    )

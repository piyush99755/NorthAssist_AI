from app.graphs.case_learning_graph import case_graph
from app.models.case_api import CaseResponse

def process_case_message(
    thread_id: str,
    message: str,
) -> CaseResponse:
    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }
    
    state = case_graph.invoke(
        {
            "user_message": message
        },
        config,
    )
    
    return CaseResponse(
        thread_id=thread_id,
        response=state["response"],
        response_type=state["response_type"],
        message_history=state.get("message_history", []),
        city=state.get("city"),
        employment_status=state.get("employment_status"),
        missing_fields=state.get("missing_fields", []),
        benefit_matches=state.get("benefit_matches", []),
        extraction_method=state.get("extraction_method"),
        extraction_warning=state.get("extraction_warning"),
    )
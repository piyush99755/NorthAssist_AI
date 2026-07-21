from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.tools.benefit_tools import search_benefit_catalog
from app.services.case_extraction_service import extract_case_information


class CaseState(TypedDict, total=False):
    user_message: str
    city: str | None
    employment_status: str | None
    missing_fields: list[str]
    benefit_matches: list[dict]
    response: str
    extraction_method: str
    extraction_warning: str | None




# Extraction node
def extract_case(state: CaseState) -> dict:
    
    result = extract_case_information(
        state["user_message"]
    )
    
    return {
        "city": result.city,
        "employment_status": result.employment_status,
        "extraction_method": result.extraction_method,
        "extraction_warning": result.warning,
    }
    
    
#  validation node    
def check_missing_information(state: CaseState) -> dict:
    missing_fields: list[str] = []
    
    if not state.get("city"):
        missing_fields.append("city")

    if not state.get("employment_status"):
        missing_fields.append("employment_status")

    return {"missing_fields": missing_fields}    

# Two Destination Nodes
def ask_clarification(state: CaseState) -> dict:
    missing = state.get("missing_fields", [])
    
    questions = {
        "city": "Which Northern Ontario city do you live in?",
        "employment_status": "What is your current employment situation?",
    }
    
    first_missing_field = missing[0]
    return {"response": questions[first_missing_field]}

def search_benefits(state: CaseState) -> dict:
    tool_result = search_benefit_catalog.invoke(
        {
            "life_event": state["user_message"],
            "location": state.get("city"),
            "employment_status": state.get("employment_status"),
        }
    )
    programs = tool_result["recommended_programs"]
    program_names = [program["name"] for program in programs]
    return {
        "benefit_matches": programs,
        "response": (
            "I found these potentially relevant programs: "
            + ", ".join(program_names)
        ),
    }
    
    
# Route

def route_after_validation(state: CaseState) -> str:
    if state.get("missing_fields"):
        return "ask_clarification"

    return "search_benefits"

builder = StateGraph(CaseState)

builder.add_node("extract_case", extract_case)
builder.add_node("check_missing_information", check_missing_information)
builder.add_node("ask_clarification", ask_clarification)
builder.add_node("search_benefits", search_benefits)

builder.add_edge(START, "extract_case")
builder.add_edge("extract_case", "check_missing_information")

builder.add_conditional_edges(
    "check_missing_information",
    route_after_validation,
    {
        "ask_clarification": "ask_clarification",
        "search_benefits": "search_benefits",
    },
)

builder.add_edge("ask_clarification", END)
builder.add_edge("search_benefits", END)

case_graph = builder.compile()

    

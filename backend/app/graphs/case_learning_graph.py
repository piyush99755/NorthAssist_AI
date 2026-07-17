from typing import TypedDict

from langgraph.graph import END, START, StateGraph

class CaseState(TypedDict, total=False):
    user_message: str
    city: str | None
    employment_status: str | None
    missing_fields: list[str]
    response: str


NORTHERN_CITIES = [
    "Sudbury",
    "Thunder Bay",
    "Timmins",
    "North Bay",
    "Sault Ste. Marie",
]

# Extraction node
def extract_case(state: CaseState) -> dict:
    message = state["user_message"]
    message_lower = message.lower()
    
    city = None
    
    for known_city in NORTHERN_CITIES:
        if known_city.lower() in message_lower:
            city = known_city   
            break
        

    employment_status = None
    job_loss_phrases = [
        "lost my job",
        "laid off",
        "unemployed",
        "no longer working",
    ]

    if any(phrase in message_lower for phrase in job_loss_phrases):
        employment_status = "unemployed"

    return {
        "city": city,
        "employment_status": employment_status,
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
    city = state["city"]
    employment_status = state["employment_status"]
    
    return {
        "response": (
            f"I have enough information to search for benefits. "
            f"City: {city}. Employment status: {employment_status}."
        )
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

    

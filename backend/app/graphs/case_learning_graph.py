import operator
from typing import Annotated, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph

from app.services.case_extraction_service import extract_case_information
from app.services.case_intent_service import classify_case_intent
from app.tools.benefit_tools import search_benefit_catalog


class CaseState(TypedDict, total=False):
    user_message: str
    message_history: Annotated[list[str], operator.add]
    city: str | None
    employment_status: str | None
    missing_fields: list[str]
    benefit_matches: list[dict]
    response_type: str
    response: str
    extraction_method: str
    extraction_warning: str | None
    current_intent: str
    intent_subject: str | None
    referenced_programs: list[str]
    intent_classification_method: str
    intent_warning: str | None


def capture_message(state: CaseState) -> dict:
    return {
        "message_history": [state["user_message"]],
    }


# Extraction node
def extract_case(state: CaseState) -> dict:
    conversation = "\n".join(
        state.get("message_history", [])
    )
    
    result = extract_case_information(conversation)

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
    return {
        "response_type": "follow_up_question",
        "response": questions[first_missing_field],
    }

def search_benefits(state: CaseState) -> dict:
    tool_result = search_benefit_catalog.invoke(
        {
            "life_event": "\n".join(
                state.get("message_history", [])
            ),
            "location": state.get("city"),
            "employment_status": state.get("employment_status"),
        }
    )
    programs = tool_result["recommended_programs"]
    program_names = [program["name"] for program in programs]
    return {
        "response_type": "benefit_cards",
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


def reset_turn(state: CaseState) -> dict:
    return {
        "missing_fields": [],
        "benefit_matches": [],
        "response": "",
        "extraction_warning": None,
    }


def classify_current_intent(state: CaseState) -> dict:
    history = state.get("message_history", [])

    result = classify_case_intent(
        latest_message=state["user_message"],
        conversation_history=history[:-1],
    )

    return {
        "current_intent": result.intent,
        "intent_subject": result.subject,
        "referenced_programs": result.referenced_programs,
        "intent_classification_method": result.classification_method,
        "intent_warning": result.warning,
    }


def acknowledge_eligibility_question(state: CaseState) -> dict:
    subject = state.get("intent_subject")
    programs = state.get("referenced_programs", [])

    program_text = (
        ", ".join(programs)
        if programs
        else "the previously recommended program"
    )

    subject_text = (
        f" for someone with the circumstance '{subject}'"
        if subject
        else ""
    )

    return {
        "response_type": "eligibility_placeholder",
        "benefit_matches": [],
        "response": (
            f"You are asking whether {program_text} may apply"
            f"{subject_text}. I have recognized this as an eligibility "
            "question, so I will not repeat the broad benefit recommendations. "
            "Grounded eligibility research is not connected yet, so I will "
            "not make an eligibility assessment."
        ),
    }


def acknowledge_new_case(state: CaseState) -> dict:
    return {
        "response_type": "case_reset_required",
        "benefit_matches": [],
        "response": (
            "I recognized that you want to start a new case. "
            "A new conversation identifier is required to safely separate "
            "the new case from the current one."
        ),
    }


def handle_other_intent(state: CaseState) -> dict:
    return {
        "response_type": "clarification",
        "benefit_matches": [],
        "response": (
            "I can help you describe your situation, find potentially "
            "relevant benefits, or ask questions about a recommended program."
        ),
    }

def route_after_intent(state: CaseState) -> str:
    return state.get("current_intent", "other")


builder = StateGraph(CaseState)

builder.add_node("extract_case", extract_case)
builder.add_node("capture_message", capture_message)
builder.add_node("check_missing_information", check_missing_information)
builder.add_node("ask_clarification", ask_clarification)
builder.add_node("search_benefits", search_benefits)
builder.add_node("reset_turn", reset_turn)
builder.add_node("classify_intent", classify_current_intent)
builder.add_node(
    "acknowledge_eligibility_question",
    acknowledge_eligibility_question,
)
builder.add_node(
    "acknowledge_new_case",
    acknowledge_new_case,
)
builder.add_node(
    "handle_other_intent",
    handle_other_intent,
)

builder.add_edge(START, "capture_message")
builder.add_edge("capture_message", "classify_intent")
builder.add_edge("classify_intent", "reset_turn")
builder.add_edge("extract_case", "check_missing_information")

builder.add_conditional_edges(
    "check_missing_information",
    route_after_validation,
    {
        "ask_clarification": "ask_clarification",
        "search_benefits": "search_benefits",
    },
)

builder.add_conditional_edges(
    "reset_turn",
    route_after_intent,
    {
        "provide_case_information": "extract_case",
        "ask_eligibility_question": "acknowledge_eligibility_question",
        "start_new_case": "acknowledge_new_case",
        "other": "handle_other_intent",
    },
)

builder.add_edge("ask_clarification", END)
builder.add_edge("search_benefits", END)
builder.add_edge("acknowledge_eligibility_question", END)
builder.add_edge("acknowledge_new_case", END)
builder.add_edge("handle_other_intent", END)

checkpointer = InMemorySaver()


case_graph = builder.compile(
    checkpointer=checkpointer,
)

    

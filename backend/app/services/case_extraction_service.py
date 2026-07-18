import os
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from app.models.case_extraction import ExtractedCase

DEFAULT_MODEL = "qwen3:4b-instruct"

SUPPORTED_CITIES = [
    "Sudbury",
    "Thunder Bay",
    "Timmins",
    "North Bay",
    "Sault Ste. Marie",
]

SYSTEM_PROMPT = """
You extract structured case information for NorthAssist AI.

Supported Northern Ontario cities:
- Sudbury
- Thunder Bay
- Timmins
- North Bay
- Sault Ste. Marie

Rules:
1. If the user explicitly mentions a supported city, return its exact
   canonical name from the list.
2. Treat phrases such as "laid off", "lost my job", "staff reductions",
   "without work", and "no longer working" as unemployed.
3. Do not invent a city or employment status.
4. Return null when information is not provided or cannot be determined.
5. Extract information only. Do not provide advice or explanations.
""".strip()

def extract_case_with_ollama(user_message: str) -> ExtractedCase:
    model_name = os.getenv("OLLAMA_MODEL", DEFAULT_MODEL)

    model = ChatOllama(
        model=model_name,
        temperature=0,
    )
    
    structured_model = model.with_structured_output(
        ExtractedCase,
        method="json_schema",
    )
    
    result = structured_model.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_message)
            
        ]
    )
    
    if not isinstance(result, ExtractedCase):
        raise TypeError("Ollama returned an unexpected extraction type.")
    
    return result
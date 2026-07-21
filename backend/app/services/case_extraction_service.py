import os
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from app.models.case_extraction import (
    ExtractedCase, CaseExtractionResult
)

DEFAULT_BASE_URL= "http://localhost:11434"
DEFAULT_MODEL = "qwen3:4b-instruct"

SUPPORTED_CITIES = [
    "Sudbury",
    "Thunder Bay",
    "Timmins",
    "North Bay",
    "Sault Ste. Marie",
]

JOB_LOSS_PHRASES = [
    "lost my job",
    "laid off",
    "unemployed",
    "no longer working",
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
    
    model = ChatOllama(
        model=os.getenv("OLLAMA_MODEL", DEFAULT_MODEL),
        base_url=os.getenv("OLLAMA_BASE_URL", DEFAULT_BASE_URL),
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

def extract_case_deterministically(
    user_message: str
) -> ExtractedCase:
    message_lower = user_message.lower()
    
    city = None
    
    for supported_city in SUPPORTED_CITIES:
        if supported_city.lower() in message_lower:
            city = supported_city
            break
        
    employment_status = None
    
    if any(
        phrase in message_lower
        for phrase in JOB_LOSS_PHRASES
    ):
        employment_status = "unemployed"
        
    return ExtractedCase(
        city=city,
        employment_status=employment_status,
    )
    

def extract_case_information(
    user_message: str,
    prefer_ollama : bool = True,
) -> CaseExtractionResult:
    if prefer_ollama:
        try:
            extracted = extract_case_with_ollama(user_message)
            
            return CaseExtractionResult (
                **extracted.model_dump(),
                extraction_method="ollama",
            )
            
        except Exception as error:
            warning = (
                "Local AI extraction failed; deterministic fallback used. "
                f"Error type: {type(error).__name__}."
            )
            
    else:
        warning = "Local AI extraction disabled; deterministic fallback used."
        
    extracted = extract_case_deterministically(user_message)
    
    return CaseExtractionResult(
        **extracted.model_dump(),
        extraction_method="deterministic",
        warning=warning,
    )

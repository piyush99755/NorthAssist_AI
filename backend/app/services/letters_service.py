import re
from datetime import datetime

from app.models.letters import LetterExplainRequest, LetterExplainResponse

PROGRAM_RULES: list[dict] = [
    {
        "id": "ei",
        "name": "Employment Insurance (EI)",
        "department": "Service Canada",
        "patterns": [
            "employment insurance", "assurance-emploi", " ei ", "ei claim", "ei benefit",
            "record of employment", " roe", "my service canada",
        ],
        "summary": "This letter is about your Employment Insurance (EI) claim with Service Canada.",
        "context_points": [
            "EI provides temporary income support if you lost your job through no fault of your own.",
            "You must file bi-weekly reports to keep receiving payments.",
            "Missing documents — like your Record of Employment (ROE) — can delay or stop your claim.",
        ],
        "default_actions": [
            "Confirm whether the letter approves, denies, or requests more information.",
            "Submit any requested documents before the deadline shown in the letter.",
            "Set up direct deposit through your My Service Canada Account.",
        ],
    },
    {
        "id": "service_canada",
        "name": "Service Canada",
        "department": "Service Canada",
        "patterns": [
            "service canada", "my service canada account", "1-800-622-6232",
            "employment and social development", "esdc",
        ],
        "summary": "This is an official notice from Service Canada about a federal program or account.",
        "context_points": [
            "Service Canada administers EI, CPP, OAS, and SIN-related services.",
            "Letters may request documents, confirm decisions, or update your benefit status.",
        ],
        "default_actions": [
            "Log in to your My Service Canada Account to view full details.",
            "Call Service Canada if you need clarification on any deadline or request.",
            "Keep a copy of this letter for your records.",
        ],
    },
    {
        "id": "ontario_works",
        "name": "Ontario Works (OW)",
        "department": "Ontario Ministry of Children, Community and Social Services",
        "patterns": [
            "ontario works", " ow ", "financial assistance", "employment assistance",
            "social assistance", "municipal social services",
        ],
        "summary": "This letter relates to Ontario Works — Ontario's financial and employment assistance program.",
        "context_points": [
            "Ontario Works provides monthly financial help and employment support activities.",
            "You must report income changes and participate in agreed employment activities.",
            "Benefit amounts depend on household size, shelter costs, and other income.",
        ],
        "default_actions": [
            "Review any decision about your eligibility or benefit amount.",
            "Report changes in income, housing, or household size to your caseworker promptly.",
            "Request an internal review within 30 days if you disagree with a decision.",
        ],
    },
    {
        "id": "odsp",
        "name": "Ontario Disability Support Program (ODSP)",
        "department": "Ontario Ministry of Children, Community and Social Services",
        "patterns": [
            "ontario disability support", " odsp", "disability support program",
            "disability benefit", "medical review", "special diet allowance",
        ],
        "summary": "This letter concerns your Ontario Disability Support Program (ODSP) application or benefits.",
        "context_points": [
            "ODSP provides income and employment supports for people with disabilities in financial need.",
            "Letters may confirm eligibility, request medical forms, or notify you of a benefit change.",
            "Medical reviews may be required to continue receiving benefits.",
        ],
        "default_actions": [
            "Check the decision date and whether the letter approves, denies, or requests more info.",
            "Submit any medical or financial documents before the deadline.",
            "Contact your local ODSP office if you need help understanding next steps.",
        ],
    },
    {
        "id": "housing",
        "name": "Housing Benefit / Rent-Geared-to-Income",
        "department": "Local Social Housing Provider",
        "patterns": [
            "rent-geared-to-income", " rgi", "social housing", "housing subsidy",
            "rent supplement", "waitlist", "unit offer", "eviction notice",
            "landlord and tenant", "housing benefit",
        ],
        "summary": "This letter is about housing assistance, social housing, or a rent subsidy program.",
        "context_points": [
            "Rent-geared-to-income (RGI) housing typically charges about 30% of household income as rent.",
            "Waitlist updates and unit offers have strict response deadlines.",
            "You must report income changes to avoid overpaying or losing eligibility.",
        ],
        "default_actions": [
            "Confirm whether this is a waitlist update, unit offer, or income review notice.",
            "Respond to any unit offer within the deadline stated in the letter.",
            "Gather proof of income and ID if your application is still being processed.",
        ],
    },
    {
        "id": "tax_credits",
        "name": "Tax Credits / CRA Notice",
        "department": "Canada Revenue Agency (CRA)",
        "patterns": [
            "canada revenue agency", " cra", "notice of assessment", "tax return",
            "gst/hst credit", "gst credit", "hst credit", "income tax", "reassessment",
            "objection", "tax credit",
        ],
        "summary": "This is a Canada Revenue Agency (CRA) notice about your taxes or tax credits.",
        "context_points": [
            "A Notice of Assessment shows whether you owe money or will receive a refund.",
            "Tax credits like GST/HST may be included in your assessment.",
            "You have 90 days to file a formal objection if you disagree with an assessment.",
        ],
        "default_actions": [
            "Compare the notice to your filed tax return for accuracy.",
            "Note any payment due date to avoid interest charges.",
            "Update other benefit applications if your income amount changed.",
        ],
    },
    {
        "id": "child_benefits",
        "name": "Canada Child Benefit (CCB)",
        "department": "Canada Revenue Agency (CRA)",
        "patterns": [
            "canada child benefit", " ccb", "child benefit", "child tax benefit",
            "ontario child benefit", "child disability benefit", "children's benefit",
        ],
        "summary": "This letter is about child benefits — payments to help families with the cost of raising children.",
        "context_points": [
            "The Canada Child Benefit (CCB) is a tax-free monthly payment based on your income and family size.",
            "Letters may confirm eligibility, request proof of custody, or notify you of payment changes.",
            "You must file taxes every year to continue receiving CCB.",
        ],
        "default_actions": [
            "Verify the payment amount and effective date in the letter.",
            "Submit any requested documents (birth certificate, custody proof, etc.).",
            "File your tax return on time each year to avoid interruptions.",
        ],
    },
]

DATE_PATTERNS = [
    re.compile(
        r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{1,2},?\s+\d{4}\b",
        re.IGNORECASE,
    ),
    re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"),
    re.compile(
        r"\b(?:Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b",
        re.IGNORECASE,
    ),
]

PHONE_PATTERN = re.compile(
    r"\b(?:1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b"
)

DOCUMENT_PATTERNS = [
    re.compile(r"(?:submit|provide|send|attach|enclose|upload)\s+(?:your\s+)?(.{10,80}?)(?:\.|,|\s+no later|\s+before|\s+by)", re.IGNORECASE),
    re.compile(r"(?:required|missing|need)\s+(?:documentation|documents|information):\s*(.{10,120})", re.IGNORECASE),
]

URGENT_WORDS = ["immediately", "urgent", "failure to", "will be denied", "final notice", "last chance", "overdue"]
DENIAL_WORDS = ["denied", "refused", "rejected", "declined", "not eligible", "terminated"]


def _normalize(text: str) -> str:
    return f" {text.lower().replace(chr(10), ' ')} "


def _detect_program(text_lower: str, letter_type: str | None) -> dict | None:
    if letter_type:
        hint = letter_type.lower().replace("_", " ")
        for rule in PROGRAM_RULES:
            if hint in rule["id"] or hint in rule["name"].lower():
                return rule

    best: dict | None = None
    best_score = 0
    for rule in PROGRAM_RULES:
        score = sum(1 for p in rule["patterns"] if p in text_lower)
        if score > best_score:
            best_score = score
            best = rule
    return best if best_score > 0 else None


def _extract_dates(text: str) -> list[str]:
    found: list[str] = []
    for pattern in DATE_PATTERNS:
        for match in pattern.findall(text):
            cleaned = match.strip()
            if cleaned and cleaned not in found:
                found.append(cleaned)
    return found[:6]


def _extract_phones(text: str) -> list[str]:
    return list(dict.fromkeys(PHONE_PATTERN.findall(text)))[:4]


def _extract_documents(text: str) -> list[str]:
    text_lower = text.lower()
    docs: list[str] = []
    seen: set[str] = set()

    keyword_docs = [
        ("record of employment", "Record of Employment (ROE)"),
        ("medical form", "Medical documentation / health forms"),
        ("proof of income", "Proof of income (pay stubs, bank statements)"),
        ("photo identification", "Government-issued photo ID"),
        ("birth certificate", "Birth certificate"),
        ("lease agreement", "Lease or rental agreement"),
        ("bank statement", "Bank statements"),
    ]
    for keyword, label in keyword_docs:
        if keyword in text_lower and label.lower() not in seen:
            docs.append(label)
            seen.add(label.lower())

    noise_fragments = (
        "this information", "the following", "additional documentation",
        "no later than", "before we can", "your most recent",
    )
    for pattern in DOCUMENT_PATTERNS:
        for match in pattern.findall(text):
            cleaned = re.sub(r"\s+", " ", match).strip(" .,")
            lower = cleaned.lower()
            if len(cleaned) < 12 or any(n in lower for n in noise_fragments):
                continue
            if "record of employment" in lower or lower.startswith("roe"):
                canonical = "Record of Employment (ROE)"
            elif lower in seen:
                continue
            else:
                canonical = cleaned[0].upper() + cleaned[1:] if cleaned else cleaned
            if canonical.lower() not in seen:
                docs.append(canonical)
                seen.add(canonical.lower())

    return docs[:5]


def _extract_deadline_sentences(text: str) -> list[str]:
    deadlines: list[str] = []
    deadline_keywords = (
        "deadline", "no later than", "due date", "within ", " days",
        "failure to", "must be received", "respond by",
    )
    chunks = []
    for line in text.splitlines():
        chunks.extend(re.split(r"(?<=[.!?])\s+", line.strip()))
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        lower = chunk.lower()
        if any(kw in lower for kw in deadline_keywords):
            if chunk not in deadlines:
                deadlines.append(chunk)
    return deadlines[:4]


def _extract_action_deadline_dates(text: str) -> list[str]:
    """Only dates on deadline lines, excluding letter creation / receipt dates."""
    skip_context = ("received on", "dated", "issued on", "claim received", "letter dated", "written on")
    dates: list[str] = []
    for line in text.splitlines():
        lower = line.lower()
        if not any(kw in lower for kw in ("no later than", "deadline", "due", "before", "within", "must be received", "respond by")):
            continue
        for pattern in DATE_PATTERNS:
            for match in pattern.findall(line):
                cleaned = match.strip()
                idx = lower.find(cleaned.lower())
                context = lower[max(0, idx - 30): idx] if idx >= 0 else lower
                if any(skip in context for skip in skip_context):
                    continue
                if cleaned and cleaned not in dates:
                    dates.append(cleaned)
    return dates[:3]


def _parse_date(date_str: str) -> datetime | None:
    formats = [
        "%B %d, %Y", "%B %d %Y", "%b %d, %Y", "%b %d %Y",
        "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y", "%d-%m-%Y",
    ]
    cleaned = date_str.replace(",", "")
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    return None


def _compute_urgency(text_lower: str, dates: list[str], deadlines: list[str]) -> tuple[int, str]:
    score = 15
    now = datetime.now()

    for date_str in dates:
        parsed = _parse_date(date_str)
        if parsed:
            days = (parsed - now).days
            if days < 0:
                score += 35
            elif days <= 7:
                score += 40
            elif days <= 30:
                score += 25
            elif days <= 60:
                score += 10

    if any(w in text_lower for w in URGENT_WORDS):
        score += 20
    if any(w in text_lower for w in DENIAL_WORDS):
        score += 15
    if len(deadlines) >= 2:
        score += 10

    score = min(100, score)
    if score >= 75:
        label = "High"
    elif score >= 45:
        label = "Moderate"
    else:
        label = "Low"
    return score, label


def _build_summary(program: dict | None, text: str, action_dates: list[str], docs: list[str]) -> str:
    if program:
        base = program["summary"]
    else:
        base = "This appears to be an official government letter that requires your attention."

    extras: list[str] = []
    if docs:
        extras.append(f"It requests: {docs[0]}" + (f" and {len(docs) - 1} other item(s)" if len(docs) > 1 else ""))
    if action_dates:
        extras.append(f"Action deadline: {action_dates[0]}.")
    elif any(w in text.lower() for w in ("no later than", "deadline", "due date")):
        extras.append("The letter includes a deadline you should act on promptly.")
    if any(w in text.lower() for w in DENIAL_WORDS):
        extras.append("The letter may contain a negative decision — you may have appeal rights.")

    return base + (" " + " ".join(extras) if extras else "")


def explain_letter(request: LetterExplainRequest) -> LetterExplainResponse:
    text = request.letter_text.strip()
    text_lower = _normalize(text)

    program = _detect_program(text_lower, request.letter_type)
    action_dates = _extract_action_deadline_dates(text)
    phones = _extract_phones(text)
    documents = _extract_documents(text)
    deadlines = _extract_deadline_sentences(text)
    urgency_score, urgency_label = _compute_urgency(text_lower, action_dates, deadlines)

    key_points: list[str] = []
    if program:
        key_points.extend(program["context_points"])
        key_points.insert(0, f"Program identified: {program['name']}")
        key_points.insert(1, f"Issuing department: {program['department']}")
    else:
        key_points.append("We analyzed the letter text using keyword and pattern detection.")
        if "service canada" in text_lower or "canada revenue" in text_lower:
            key_points.append("This appears to be a federal government notice.")
        elif "ontario" in text_lower:
            key_points.append("This appears to be an Ontario provincial government notice.")

    if documents:
        key_points.append(f"Documents requested: {', '.join(documents[:3])}")
    if phones:
        key_points.append(f"Contact: {phones[0]}")
    if action_dates:
        key_points.append(f"Action deadline: {action_dates[0]}")

    action_items: list[str] = []
    if program:
        action_items.extend(program["default_actions"])
    else:
        action_items = [
            "Read the full letter and identify the main decision or request.",
            "Mark any deadlines on your calendar.",
            "Call 211 Ontario (dial 2-1-1) for free local support navigating government programs.",
        ]

    if documents:
        action_items.insert(0, f"Gather and submit: {documents[0]}")
    if phones:
        action_items.append(f"Call {phones[0]} if you have questions about this letter.")

    if not deadlines:
        deadlines = [
            "Review the letter for any 'by', 'before', or 'no later than' dates.",
            "Appeal or review periods are often 30 days for provincial programs and 90 days for CRA notices.",
        ]

    return LetterExplainResponse(
        summary=_build_summary(program, text, action_dates, documents),
        key_points=key_points[:6],
        action_items=list(dict.fromkeys(action_items))[:6],
        deadlines=deadlines,
        detected_program=program["name"] if program else "Government Notice",
        detected_department=program["department"] if program else None,
        urgency_score=urgency_score,
        urgency_label=urgency_label,
        extracted_dates=action_dates,
        extracted_phones=phones,
        requested_documents=documents,
    )

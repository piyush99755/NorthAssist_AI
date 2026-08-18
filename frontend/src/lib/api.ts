// Unset VITE_API_BASE to use the Vite dev proxy (same-origin, no CORS).
// Set to http://127.0.0.1:8000 or an ngrok URL only when the proxy is unavailable.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_BASE.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type RecommendedProgram = {
  name: string;
  description: string;
  eligibility: string;
  url: string;
};

export type CaseResponseType =
  | "benefit_cards"
  | "follow_up_question"
  | "eligibility_placeholder"
  | "case_reset_required"
  | "clarification";

export type CaseResponse = {
  thread_id: string;
  response: string;
  response_type: CaseResponseType;
  message_history: string[];
  city: string | null;
  employment_status: string | null;
  missing_fields: string[];
  benefit_matches: RecommendedProgram[];
  extraction_method: string | null;
  extraction_warning: string | null;
};

export async function createCase(message: string): Promise<CaseResponse> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify({ message }),
  });

  return handle<CaseResponse>(res);
}

export async function continueCase(threadId: string, message: string): Promise<CaseResponse> {
  const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(threadId)}/messages`, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify({ message }),
  });

  return handle<CaseResponse>(res);
}

export type LifeEventAnalyzeResponse = {
  life_event: string;
  summary: string;
  recommended_programs: RecommendedProgram[];
};

export type UserProfile = {
  age?: number | null;
  household_size?: number | null;
  employment_status?: string | null;
};

export async function analyzeLifeEvent(body: {
  life_event: string;
  location?: string | null;
  profile?: UserProfile | null;
}): Promise<LifeEventAnalyzeResponse> {
  const res = await fetch(`${API_BASE}/life-event/analyze`, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify(body),
  });
  return handle<LifeEventAnalyzeResponse>(res);
}

export type LetterExplainResponse = {
  summary: string;
  key_points: string[];
  action_items: string[];
  deadlines: string[];
  detected_program?: string | null;
  detected_department?: string | null;
  urgency_score?: number;
  urgency_label?: string;
  extracted_dates?: string[];
  extracted_phones?: string[];
  requested_documents?: string[];
};

export async function explainLetter(body: {
  letter_text: string;
  letter_type?: string | null;
}): Promise<LetterExplainResponse> {
  const res = await fetch(`${API_BASE}/letters/explain`, {
    method: "POST",
    headers: requestHeaders(),
    body: JSON.stringify(body),
  });
  return handle<LetterExplainResponse>(res);
}

export type ResourceResult = {
  name: string;
  description: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  url: string;
};

export type ResourceSearchResponse = {
  query: string | null;
  filters: { city?: string | null; category?: string | null };
  results: ResourceResult[];
  total: number;
  is_fallback?: boolean;
  fallback_message?: string | null;
  suggested_next_steps?: string[];
};

export async function searchResources(params: {
  q?: string;
  city?: string;
  category?: string;
}): Promise<ResourceSearchResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.city) search.set("city", params.city);
  if (params.category) search.set("category", params.category);
  const qs = search.toString();
  const res = await fetch(`${API_BASE}/resources/search${qs ? `?${qs}` : ""}`, {
    headers: requestHeaders(),
  });
  return handle<ResourceSearchResponse>(res);
}

// Helpers to map assessment answers → analyze request
export function buildLifeEventRequest(
  answers: Record<string, string>,
  situationId?: string | null,
) {
  const situationLabel: Record<string, string> = {
    student: "I am a student",
    newcomer: "I am a newcomer to Canada",
    parent: "I am a new parent",
    job: "I recently lost my job",
    housing: "I am facing housing challenges",
    senior: "I am a senior",
    other: "I need general support",
  };
  const parts: string[] = [];
  if (situationId && situationLabel[situationId]) parts.push(situationLabel[situationId]);
  if (answers.employment) parts.push(`Employment status: ${answers.employment}`);
  if (answers.income) parts.push(`Household income: ${answers.income}`);
  if (answers.dependents && answers.dependents !== "No")
    parts.push(`Dependents: ${answers.dependents}`);
  const life_event = parts.join(". ") || "I am exploring available support";

  const ageNum = answers.age ? parseInt(answers.age, 10) : undefined;
  const depNum =
    answers.dependents === "No"
      ? 1
      : answers.dependents === "3 or more"
        ? 4
        : answers.dependents
          ? 1 + parseInt(answers.dependents, 10)
          : undefined;

  return {
    life_event,
    location: answers.city || null,
    profile: {
      age: Number.isFinite(ageNum) ? ageNum : null,
      household_size: depNum ?? null,
      employment_status: answers.employment || null,
    },
  };
}

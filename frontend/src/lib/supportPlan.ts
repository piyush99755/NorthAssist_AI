import type { RecommendedProgram, ResourceResult } from "@/lib/api";

/** Illustrative monthly estimates for demo — not official benefit calculations. */
const MONTHLY_ESTIMATES: { match: string; amount: number; action: string }[] = [
  { match: "employment insurance", amount: 1400, action: "Apply for Employment Insurance (EI)" },
  { match: "ontario works", amount: 733, action: "Apply for Ontario Works" },
  { match: "odsp", amount: 1368, action: "Apply for ODSP" },
  { match: "disability support", amount: 1368, action: "Apply for ODSP" },
  { match: "child benefit", amount: 520, action: "Confirm Canada Child Benefit eligibility" },
  { match: "rent-geared", amount: 450, action: "Apply for rent-geared-to-income housing" },
  { match: "homelessness prevention", amount: 600, action: "Contact local housing support" },
  { match: "guaranteed income supplement", amount: 1100, action: "Apply for GIS through Service Canada" },
  { match: "ohip", amount: 0, action: "Confirm OHIP enrollment" },
  { match: "baby bundle", amount: 200, action: "Register for Ontario Baby Bundle" },
  { match: "nohfc", amount: 0, action: "Explore NOHFC business programs" },
];

export type SupportPlan = {
  estimatedMonthly: number;
  estimatedAnnual: number;
  priorityLevel: "High" | "Medium" | "Low";
  immediateActions: string[];
  weekChecklist: string[];
  monthTimeline: { label: string; items: string[] }[];
  localServices: ResourceResult[];
};

function estimateForProgram(name: string): { amount: number; action: string } {
  const lower = name.toLowerCase();
  for (const row of MONTHLY_ESTIMATES) {
    if (lower.includes(row.match)) return { amount: row.amount, action: row.action };
  }
  return { amount: 250, action: `Review eligibility for ${name}` };
}

function priorityFromPrograms(programs: RecommendedProgram[], situationId?: string | null): "High" | "Medium" | "Low" {
  if (situationId === "job" || situationId === "housing") return "High";
  if (programs.length >= 3) return "High";
  if (programs.length >= 1) return "Medium";
  return "Low";
}

export function buildSupportPlan(
  programs: RecommendedProgram[],
  resources: ResourceResult[],
  city?: string | null,
  situationId?: string | null,
): SupportPlan {
  const estimates = programs.map((p) => ({ ...estimateForProgram(p.name), name: p.name }));
  const estimatedMonthly = estimates.reduce((sum, e) => sum + e.amount, 0);
  const priorityLevel = priorityFromPrograms(programs, situationId);

  const immediateActions = [
    ...estimates.slice(0, 3).map((e) => e.action),
    city ? `Call 211 Ontario for ${city} service referrals` : "Call 211 Ontario (dial 2-1-1) for local help",
  ].slice(0, 4);

  const weekChecklist = [
    ...estimates.slice(0, 2).map((e) => `Start: ${e.action}`),
    resources[0] ? `Visit ${resources[0].name}` : "Search local employment or food services",
    "Gather ID, proof of income, and recent mail from government agencies",
    "Create a My Service Canada Account if applying for federal benefits",
  ].slice(0, 4);

  const monthTimeline = [
    {
      label: "Today",
      items: immediateActions.slice(0, 2).map((a) => a.replace(/^Apply for /, "Apply for ")),
    },
    {
      label: "This Week",
      items: weekChecklist,
    },
    {
      label: "This Month",
      items: [
        ...programs.slice(0, 2).map((p) => `Follow up on ${p.name}`),
        "Review additional benefit programs you may qualify for",
        resources[1] ? `Connect with ${resources[1].name}` : "Explore community support services",
      ],
    },
  ];

  return {
    estimatedMonthly,
    estimatedAnnual: estimatedMonthly * 12,
    priorityLevel,
    immediateActions,
    weekChecklist,
    monthTimeline,
    localServices: resources.slice(0, 3),
  };
}

export function priorityTone(level: SupportPlan["priorityLevel"]) {
  if (level === "High") return "bg-destructive/15 text-destructive border-destructive/30";
  if (level === "Medium") return "bg-warning/15 text-foreground border-warning/30";
  return "bg-success/15 text-success border-success/30";
}

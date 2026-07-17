import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import type { RecommendedProgram } from "@/lib/api";
import { searchResources } from "@/lib/api";
import { buildSupportPlan, priorityTone } from "@/lib/supportPlan";

export function SupportPlan({
  programs,
  city,
  situationId,
}: {
  programs: RecommendedProgram[];
  city?: string | null;
  situationId?: string | null;
}) {
  const { data: resourceData } = useQuery({
    queryKey: ["support-plan-resources", city],
    queryFn: () => searchResources({ city: city?.trim() || undefined }),
    staleTime: 60_000,
  });

  const plan = buildSupportPlan(programs, resourceData?.results ?? [], city, situationId);

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Your personal action plan
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your Support Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A caseworker-style roadmap based on your matched programs and local services.
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${priorityTone(plan.priorityLevel)}`}>
          <Zap className="h-3.5 w-3.5" /> Priority: {plan.priorityLevel}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" /> Estimated Monthly Support
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-primary">${plan.estimatedMonthly.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ~${plan.estimatedAnnual.toLocaleString()}/year across {programs.length} program{programs.length !== 1 ? "s" : ""}
          </p>
          <p className="mt-3 text-[11px] text-muted-foreground italic">Illustrative estimate for planning — not an official calculation.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-4 w-4 text-warning" /> Immediate Actions
          </div>
          <ul className="mt-3 space-y-2">
            {plan.immediateActions.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ClipboardList className="h-4 w-4 text-secondary" /> This Week Checklist
          </div>
          <ul className="mt-3 space-y-2">
            {plan.weekChecklist.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4 text-success" /> Recommended Local Services
          </div>
          <ul className="mt-3 space-y-3">
            {plan.localServices.map((r) => (
              <li key={`${r.name}-${r.city}`} className="rounded-xl bg-muted/50 p-3">
                <div className="text-sm font-semibold text-foreground">{r.name}</div>
                <div className="text-xs capitalize text-muted-foreground">{r.category} · {r.city}</div>
              </li>
            ))}
            {plan.localServices.length === 0 && (
              <li className="text-sm text-muted-foreground">Dial 211 Ontario for personalized local referrals.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CalendarCheck className="h-4 w-4 text-primary" /> Next 30 Days Timeline
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {plan.monthTimeline.map((block) => (
            <div key={block.label} className="relative rounded-xl border border-border bg-background p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">{block.label}</div>
              <ul className="mt-2 space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-1.5 text-xs text-foreground">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

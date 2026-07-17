import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, FileText, ArrowRight, CheckCircle2, Loader2, ListChecks, Clock, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { explainLetter } from "@/lib/api";

function urgencyBadge(score: number, label?: string) {
  const level = label ?? (score >= 75 ? "High" : score >= 45 ? "Moderate" : "Low");
  if (level === "High" || score >= 75) {
    return { level: "High", tone: "bg-destructive text-destructive-foreground", ring: "ring-destructive/30" };
  }
  if (level === "Moderate" || score >= 45) {
    return { level: "Moderate", tone: "bg-warning text-foreground", ring: "ring-warning/30" };
  }
  return { level: "Low", tone: "bg-success/20 text-success", ring: "ring-success/30" };
}

export function LetterSummary({
  onContinue,
  letterText,
}: {
  onContinue: () => void;
  letterText: string;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["letter-explain", letterText.slice(0, 200), letterText.length],
    queryFn: () => explainLetter({ letter_text: letterText }),
    enabled: letterText.trim().length > 0,
    staleTime: 5 * 60_000,
    retry: 2,
  });

  const urgency = data?.urgency_score ?? 0;
  const badge = urgencyBadge(urgency, data?.urgency_label);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {isLoading ? "Analyzing…" : "Document analyzed"}
        </span>
        {data?.detected_program && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <FileText className="h-3 w-3" /> {data.detected_program}
          </span>
        )}
        {data && (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-2 ${badge.tone} ${badge.ring}`}>
            <ShieldAlert className="h-3 w-3" /> Urgency: {badge.level}
          </span>
        )}
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Document Summary</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">Here's what your letter says, in plain language.</p>

      {error && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="h-4 w-4 text-warning" /> Having trouble reaching the server — here's guidance based on your letter:
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Review the letter for deadlines, contact numbers, and any documents requested. Call 211 Ontario (2-1-1) for free help.
          </p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>Retry analysis</Button>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className={`mt-6 flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${badge.level === "High" ? "border-destructive/30 bg-destructive/5" : badge.level === "Moderate" ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-xl text-sm font-bold ${badge.tone}`}>
                {badge.level}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response urgency</div>
                <div className="text-sm font-medium text-foreground">
                  {badge.level === "High" && "Act within the next few days"}
                  {badge.level === "Moderate" && "Review and respond this week"}
                  {badge.level === "Low" && "Review when convenient"}
                </div>
              </div>
            </div>
            {data.detected_department && (
              <div className="text-xs text-muted-foreground">From: {data.detected_department}</div>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <FileText className="h-4 w-4" /> Plain-language summary
            </div>
            <p className="mt-2 text-base leading-relaxed text-foreground">{data.summary}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Section icon={ListChecks} title="Key Points" tone="bg-primary/10 text-primary" items={data.key_points} />
            <Section icon={AlertCircle} title="Action Items" tone="bg-warning/15 text-foreground" items={data.action_items} />
            <Section icon={Calendar} title="Deadlines" tone="bg-destructive/10 text-destructive" items={data.deadlines} className="md:col-span-2" />
            {(data.requested_documents?.length ?? 0) > 0 && (
              <Section icon={FileText} title="Documents Requested" tone="bg-secondary/15 text-secondary" items={data.requested_documents ?? []} className="md:col-span-2" />
            )}
            {(data.extracted_phones?.length ?? 0) > 0 && (
              <Section icon={Clock} title="Contact Numbers" tone="bg-muted text-foreground" items={data.extracted_phones ?? []} className="md:col-span-2" />
            )}
          </div>
        </>
      )}

      <div className="mt-10 flex justify-end">
        <Button onClick={onContinue} size="lg">
          See local resources <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  tone,
  items,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: string;
  items: string[];
  className?: string;
}) {
  const display = items.length > 0 ? items : ["Review your letter carefully for details on this topic."];
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`} style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      <ul className="mt-3 space-y-2">
        {display.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

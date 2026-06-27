import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, FileText, ArrowRight, CheckCircle2, Loader2, ListChecks } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { explainLetter } from "@/lib/api";

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
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {isLoading ? "Analyzing…" : "Document analyzed"}
        </span>
        <span className="text-xs text-muted-foreground">{letterText.length.toLocaleString()} characters</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Document Summary</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">Here's what your letter says, in plain language.</p>

      {error && (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Couldn't analyze the letter.</div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
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
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <FileText className="h-4 w-4" /> Plain-language summary
            </div>
            <p className="mt-2 text-base leading-relaxed text-foreground">{data.summary}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Section
              icon={ListChecks}
              title="Key Points"
              tone="bg-primary/10 text-primary"
              items={data.key_points}
              emptyText="No key points returned."
            />
            <Section
              icon={AlertCircle}
              title="Action Items"
              tone="bg-warning/15 text-foreground"
              items={data.action_items}
              emptyText="No actions required."
            />
            <Section
              icon={Calendar}
              title="Deadlines"
              tone="bg-destructive/10 text-destructive"
              items={data.deadlines}
              emptyText="No deadlines mentioned."
              className="md:col-span-2"
            />
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
  emptyText,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: string;
  items: string[];
  emptyText: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`} style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      {items.length === 0 ? (
        <div className="mt-3 text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

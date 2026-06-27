import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ExternalLink, Sparkles, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyzeLifeEvent, buildLifeEventRequest } from "@/lib/api";

export function Benefits({
  onContinue,
  answers,
  situationId,
}: {
  onContinue: () => void;
  answers: Record<string, string>;
  situationId?: string | null;
}) {
  const request = buildLifeEventRequest(answers, situationId);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["life-event", request],
    queryFn: () => analyzeLifeEvent(request),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col items-start gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Personalized for you
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Support Opportunities</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {answers.city ? `Tailored for ${answers.city} · ` : ""}Based on your situation, here's what may be available.
        </p>
      </div>

      {/* Summary card */}
      <div
        className="mt-8 overflow-hidden rounded-3xl border border-border p-6 text-primary-foreground sm:p-8"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-widest text-white/75">AI Summary</div>
            {isLoading ? (
              <div className="mt-3 flex items-center gap-2 text-white/90">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your situation…
              </div>
            ) : error ? (
              <div className="mt-3 text-sm text-white/90">Couldn't reach the analysis service.</div>
            ) : (
              <p className="mt-2 text-base leading-relaxed text-white/95 sm:text-lg">{data?.summary}</p>
            )}
            {data && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/85">
                <TrendingUp className="h-4 w-4" /> {data.recommended_programs.length} recommended programs
              </div>
            )}
          </div>
          <Button onClick={onContinue} size="lg" className="bg-white text-primary hover:bg-white/90">
            Find Resources <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Programs */}
      {error && (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Failed to load programs.</div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      )}
      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      )}
      {data && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.recommended_programs.map((p) => (
            <div key={p.name} className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommended Program</div>
                  <h3 className="mt-0.5 text-lg font-semibold text-foreground">{p.name}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-success/30 bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  Match
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-3 rounded-xl bg-muted/60 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Eligibility</div>
                <div className="mt-1 text-xs text-foreground/90">{p.eligibility}</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Worth reviewing
                </div>
                <a href={p.url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="gap-1">
                    Learn More <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
          {data.recommended_programs.length === 0 && (
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No programs matched yet. Try refining your answers.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

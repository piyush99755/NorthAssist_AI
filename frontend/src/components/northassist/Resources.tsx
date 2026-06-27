import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, ExternalLink, Sparkles, Loader2, AlertCircle, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchResources } from "@/lib/api";

const categories = ["All", "Food", "Housing", "Employment", "Healthcare", "Legal"] as const;
type Cat = (typeof categories)[number];

const categoryColors: Record<string, string> = {
  food: "bg-warning/15 text-foreground",
  housing: "bg-secondary/15 text-secondary",
  employment: "bg-primary/10 text-primary",
  healthcare: "bg-success/15 text-success",
  legal: "bg-destructive/10 text-destructive",
};

export function Resources({ onRestart, defaultCity }: { onRestart: () => void; defaultCity?: string | null }) {
  const [active, setActive] = useState<Cat>("All");
  const [q, setQ] = useState("");
  const [city, setCity] = useState(defaultCity ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources", q, city, active],
    queryFn: () =>
      searchResources({
        q: q.trim() || undefined,
        city: city.trim() || undefined,
        category: active === "All" ? undefined : active.toLowerCase(),
      }),
    staleTime: 60_000,
  });
  const visible = data?.results ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary">
        <Sparkles className="h-3.5 w-3.5" /> Curated for your situation
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Local Resources Near You</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Based on your situation, these organizations may be able to help.
      </p>

      <form
        className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_220px_auto]"
        onSubmit={(e) => { e.preventDefault(); refetch(); }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources…" className="pl-9 h-11" />
        </div>
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (e.g. Sudbury)" className="h-11" />
        <Button type="submit" size="lg">Search</Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Failed to load resources.</div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching…
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const catKey = r.category.toLowerCase();
            return (
              <div key={`${r.name}-${r.city}`} className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5" style={{ boxShadow: "var(--shadow-soft)" }}>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${categoryColors[catKey] ?? "bg-muted text-foreground"}`}>{r.category}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {r.address}</div>
                  <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {r.phone}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      Visit Website <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
          {!isLoading && visible.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No resources match your search. Try a different city or category.
            </div>
          )}
        </div>
      )}

      <div className="mt-12 overflow-hidden rounded-3xl border border-border p-6 text-primary-foreground sm:p-8" style={{ background: "var(--gradient-hero)" }}>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h3 className="text-xl font-bold sm:text-2xl">You're not alone in this.</h3>
            <p className="mt-1 text-sm text-white/85">Want to explore a different situation or restart the assessment?</p>
          </div>
          <Button onClick={onRestart} className="bg-white text-primary hover:bg-white/90">
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}

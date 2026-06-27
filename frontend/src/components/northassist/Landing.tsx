import { Button } from "@/components/ui/button";
import { situations } from "@/data/mock";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Compass,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";

type Props = {
  onStartBenefits: () => void;
  onPickSituation: (id: string) => void;
  onStartLetter: () => void;
  onBrowseResources: () => void;
};

export function Landing({ onStartBenefits, onPickSituation, onStartLetter, onBrowseResources }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative isolate overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Left: copy */}
          <div>
            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Made for Northern Ontario residents
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Government support,
              <br />
              <span className="text-white/80">made human.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
              Discover benefits you qualify for, understand confusing government letters, and find community resources near you — all in plain language.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={onStartBenefits}
                className="bg-white text-primary hover:bg-white/90"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                Find My Benefits <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onStartLetter}
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <FileText className="mr-1 h-4 w-4" /> Explain a Letter
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/80">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Private & secure</div>
              <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Plain-language AI</div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Local-first</div>
            </div>
          </div>

          {/* Right: layered preview cards */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-white/10 blur-2xl" />

            {/* Floating: estimated support */}
            <div className="relative ml-auto w-[88%] rotate-[-2deg] rounded-2xl border border-white/30 bg-white p-5 text-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Estimated Support</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-primary">$3,200</span>
                <span className="text-sm text-muted-foreground">/year</span>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { name: "Employment Insurance", match: 95 },
                  { name: "Ontario Trillium Benefit", match: 88 },
                  { name: "GST/HST Credit", match: 92 },
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5">
                    <span className="truncate text-xs font-medium">{b.name}</span>
                    <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                      {b.match}% match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating: letter explainer */}
            <div className="relative -mt-10 mr-auto w-[78%] rotate-[3deg] rounded-2xl border border-white/30 bg-white p-4 text-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">EI-Notice-2026.pdf</div>
                  <div className="text-[10px] text-muted-foreground">Explained in plain language</div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> You need to submit your Record of Employment.</div>
                <div className="flex items-start gap-1.5"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" /> Action required within 18 days.</div>
                <div className="flex items-start gap-1.5"><Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> Deadline: July 15, 2026.</div>
              </div>
            </div>

            {/* Floating: resource chip */}
            <div className="absolute -bottom-4 right-4 w-56 rotate-[-4deg] rounded-xl border border-white/30 bg-white p-3 text-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-secondary/15 text-secondary">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">Sudbury Food Bank</div>
                  <div className="text-[10px] text-muted-foreground">0.8 km away</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three feature tracks */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">How we can help</div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pick what you need today.
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeatureCard
            tone="primary"
            icon={<Compass className="h-5 w-5" />}
            title="Discover Benefits"
            body="Tell us your situation. We'll match you with government programs you may qualify for."
            cta="Start assessment"
            onClick={onStartBenefits}
          />
          <FeatureCard
            tone="secondary"
            icon={<FileText className="h-5 w-5" />}
            title="Understand a Letter"
            body="Upload a government letter or notice and get a plain-language explanation and next steps."
            cta="Upload a document"
            onClick={onStartLetter}
          />
          <FeatureCard
            tone="accent"
            icon={<Users className="h-5 w-5" />}
            title="Local Resources"
            body="Browse food, housing, employment, healthcare, and legal supports near you."
            cta="Browse resources"
            onClick={onBrowseResources}
          />
        </div>
      </section>

      {/* Situations — quick entry into the benefits track */}
      <section id="situations" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">Quick start</div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What best describes your situation today?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Pick the closest match — we'll guide you to the right supports.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {situations.map((s) => (
              <button
                key={s.id}
                onClick={() => onPickSituation(s.id)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "var(--gradient-hero)" }} />
                <div className="text-3xl">{s.icon}</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{s.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.description}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  tone,
  icon,
  title,
  body,
  cta,
  onClick,
}: {
  tone: "primary" | "secondary" | "accent";
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/15 text-secondary",
    accent: "bg-success/15 text-success",
  };
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col items-start overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${toneMap[tone]}`}>{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

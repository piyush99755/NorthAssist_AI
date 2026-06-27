import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { questions } from "@/data/mock";
import { ArrowLeft, ArrowRight, Bot } from "lucide-react";

export function Assessment({ onBack, onDone }: { onBack: () => void; onDone: (answers: Record<string, string>) => void }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = questions[i];
  const value = answers[q.id] ?? "";
  const progress = ((i + 1) / questions.length) * 100;

  const canNext = value.trim().length > 0;
  const next = () => {
    if (i < questions.length - 1) setI(i + 1);
    else onDone(answers);
  };
  const prev = () => (i === 0 ? onBack() : setI(i - 1));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Question {i + 1} of {questions.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--gradient-hero)" }} />
      </div>

      <div className="mt-10 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">NorthAssist</div>
          <h2 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{q.prompt}</h2>

          <div className="mt-6">
            {q.type === "choice" ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options!.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      value === opt
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                autoFocus
                type={q.type}
                placeholder={q.placeholder}
                value={value}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && canNext && next()}
                className="h-12 text-base"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={prev}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={next} disabled={!canNext} size="lg">
          {i === questions.length - 1 ? "See Results" : "Next"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

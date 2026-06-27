import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/northassist/TopNav";
import { Landing } from "@/components/northassist/Landing";
import { Assessment } from "@/components/northassist/Assessment";
import { Benefits } from "@/components/northassist/Benefits";
import { LetterUpload } from "@/components/northassist/LetterUpload";
import { LetterSummary } from "@/components/northassist/LetterSummary";
import { Resources } from "@/components/northassist/Resources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NorthAssist AI — Support for Northern Ontario" },
      { name: "description", content: "Discover government benefits, understand official letters, and find local resources in Northern Ontario — all in plain language." },
      { property: "og:title", content: "NorthAssist AI" },
      { property: "og:description", content: "Discover support, understand government letters, and access community resources." },
    ],
  }),
  component: Index,
});

function Index() {
  type View =
    | { name: "home" }
    | { name: "assessment" }
    | { name: "benefits" }
    | { name: "letter-upload" }
    | { name: "letter-summary" }
    | { name: "resources" };

  const [view, setView] = useState<View>({ name: "home" });
  const [situation, setSituation] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [letterText, setLetterText] = useState<string>("");

  const go = (next: View) => {
    setView(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goHome = () => {
    setSituation(null);
    setAnswers({});
    setLetterText("");
    go({ name: "home" });
  };

  const activeId =
    view.name === "home"
      ? "home"
      : view.name === "assessment" || view.name === "benefits"
      ? "benefits"
      : view.name === "letter-upload" || view.name === "letter-summary"
      ? "letter"
      : "resources";

  const navItems = [
    { id: "home", label: "Home", onClick: goHome },
    { id: "benefits", label: "Find Benefits", onClick: () => go({ name: "assessment" }) },
    { id: "letter", label: "Explain a Letter", onClick: () => go({ name: "letter-upload" }) },
    { id: "resources", label: "Local Resources", onClick: () => go({ name: "resources" }) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav items={navItems} onHome={goHome} activeId={activeId} />
      {view.name === "home" && (
        <Landing
          onStartBenefits={() => go({ name: "assessment" })}
          onPickSituation={(id) => { setSituation(id); go({ name: "assessment" }); }}
          onStartLetter={() => go({ name: "letter-upload" })}
          onBrowseResources={() => go({ name: "resources" })}
        />
      )}
      {view.name === "assessment" && (
        <Assessment
          onBack={goHome}
          onDone={(a) => { setAnswers(a); go({ name: "benefits" }); }}
        />
      )}
      {view.name === "benefits" && (
        <Benefits answers={answers} situationId={situation} onContinue={() => go({ name: "resources" })} />
      )}
      {view.name === "letter-upload" && (
        <LetterUpload
          onDone={(text) => { setLetterText(text); go({ name: "letter-summary" }); }}
          onSkip={goHome}
        />
      )}
      {view.name === "letter-summary" && (
        <LetterSummary letterText={letterText} onContinue={() => go({ name: "resources" })} />
      )}
      {view.name === "resources" && (
        <Resources onRestart={goHome} defaultCity={answers.city ?? null} />
      )}

      <footer className="border-t border-border/60 py-8 mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
          NorthAssist AI · Built for Northern Ontario residents · Demo MVP
        </div>
      </footer>
    </div>
  );
}

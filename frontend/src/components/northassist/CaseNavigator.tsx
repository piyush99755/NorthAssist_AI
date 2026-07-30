import { type FormEvent, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, ExternalLink, Loader2, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { continueCase, createCase, type CaseResponse } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function CaseNavigator({ onBack }: { onBack: () => void }) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Tell me what has changed in your life, and I'll help identify potentially relevant support programs.",
    },
  ]);
  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();

    if (!message || isLoading) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const result = threadId ? await continueCase(threadId, message) : await createCase(message);

      setThreadId(result.thread_id);
      setCaseData(result);
      setMessages((current) => [...current, { role: "assistant", content: result.response }]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">AI Case Navigator</p>
        <h1 className="text-3xl font-bold text-foreground">Find support through a conversation</h1>
        <p className="mt-2 text-muted-foreground">
          NorthAssist asks only for information needed to search its trusted benefit catalogue.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-5">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.content}
            </div>

            {message.role === "user" && (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing with the local AI...
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {caseData?.extraction_warning && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Local AI fallback used</p>
            <p className="mt-1">{caseData.extraction_warning}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="For example: I recently lost my job..."
          disabled={isLoading}
          maxLength={4000}
          className="min-h-24"
        />

        <div className="flex justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </form>

      {caseData && caseData.benefit_matches.length > 0 && (
        <section className="mt-10">
          <div className="mb-4">
            <p className="text-sm font-medium text-primary">Trusted benefit catalogue</p>
            <h2 className="text-2xl font-semibold text-foreground">
              Potentially relevant programs
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {caseData.benefit_matches.map((program) => (
              <article key={program.url} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{program.name}</h3>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{program.description}</p>
                <div className="mt-4 rounded-xl bg-muted p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Eligibility to review
                  </p>
                  <p className="mt-1 text-sm text-foreground">{program.eligibility}</p>
                </div>
                <a
                  href={program.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View official program
                  <ExternalLink className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {caseData?.extraction_method && (
        <p className="mt-4 text-xs text-muted-foreground">
          Extraction method: {caseData.extraction_method}
        </p>
      )}
    </div>
  );
}

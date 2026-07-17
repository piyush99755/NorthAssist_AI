import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, FileText, Upload, ArrowRight, Sparkles } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/** Demo-safe: file upload hidden until parsing is reliable. Code kept for future use. */
const ENABLE_FILE_UPLOAD = false;

const SAMPLE_LETTER = `Dear Applicant,

We are writing regarding your Employment Insurance (EI) claim received on June 1, 2026. Before we can process your application, we require additional documentation.

Please submit your Record of Employment (ROE) from your most recent employer no later than July 15, 2026. Failure to provide this document by the deadline may result in your application being denied.

You may upload your ROE through your My Service Canada Account or call 1-800-622-6232 for assistance.

Sincerely,
Service Canada`;

export function LetterUpload({
  onDone,
  onSkip,
}: {
  onDone: (letterText: string) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: { str: string }) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    try {
      if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
        setText(await file.text());
        return;
      }
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setIsProcessing(true);
        const pdfText = await extractPdfText(file);
        if (pdfText?.trim()) setText(pdfText);
        else alert("No readable text was found in this PDF.");
        setIsProcessing(false);
        return;
      }
      if (file.type.startsWith("image/")) {
        alert("Image OCR is not implemented yet. Please paste the text manually.");
        return;
      }
      alert("Unsupported file type.");
    } catch {
      alert("Failed to process file. Please paste the letter text manually.");
      setIsProcessing(false);
    }
  };

  const canSubmit = text.trim().length > 10;
  const submit = () => {
    if (text.trim()) onDone(text.trim());
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Need help understanding a government letter?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Paste a government letter below or use a sample letter — NorthAssist AI will explain it in plain language.
      </p>

      {ENABLE_FILE_UPLOAD ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="mt-8 grid place-items-center rounded-3xl border-2 border-dashed border-primary/30 bg-card p-10 text-center"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="grid h-16 w-16 place-items-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            <Upload className="h-7 w-7" />
          </div>
          <div className="mt-4 text-lg font-semibold text-foreground">Drag & drop your document</div>
          <input ref={inputRef} type="file" accept="image/*,application/pdf,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => inputRef.current?.click()}><Upload className="mr-1 h-4 w-4" /> Upload File</Button>
            <Button variant="outline" onClick={() => inputRef.current?.click()}><FileText className="mr-1 h-4 w-4" /> Browse Files</Button>
            <Button variant="outline" onClick={() => inputRef.current?.click()}><Camera className="mr-1 h-4 w-4" /> Use Camera</Button>
          </div>
          {fileName && <div className="mt-4 text-xs text-muted-foreground">Attached: {fileName}</div>}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-primary/20 bg-card p-6 sm:p-8" style={{ background: "var(--gradient-card)" }}>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">Paste your letter text</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy the contents of your government letter into the box below, or try our sample EI notice for a demo.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Letter text</label>
          <button
            type="button"
            onClick={() => { setText(SAMPLE_LETTER); setFileName("EI-Notice-2026.pdf"); }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Sparkles className="h-3 w-3" /> Use sample letter
          </button>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the contents of your government letter here…"
          className="min-h-[220px] text-sm"
          disabled={isProcessing}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onSkip}>Skip for now</Button>
        <Button onClick={submit} disabled={!canSubmit || isProcessing} size="lg">
          Explain this letter <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

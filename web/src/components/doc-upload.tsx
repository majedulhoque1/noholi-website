import { ChevronDown, FileText, PenLine, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SubmitMethod = "write" | "upload";
export type UploadedDoc = { name: string; ext: string; size: number; progress: number };

export const MAX_DOC_MB = 10;
const OK = ["doc", "docx", "pdf"];

export const fmtSize = (b: number) =>
  b < 1024 * 1024
    ? `${Math.max(1, Math.round(b / 1024))} KB`
    : `${(b / 1024 / 1024).toFixed(1)} MB`;

export function MethodChoice({
  value,
  onChange,
}: {
  value: SubmitMethod;
  onChange: (v: SubmitMethod) => void;
}) {
  const opts = [
    ["write", PenLine, "Write here", "Write or paste your work directly into Noholi."],
    [
      "upload",
      Upload,
      "Upload a document",
      "Already wrote it offline? Upload your document instead.",
    ],
  ] as const;
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">How would you like to submit?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {opts.map(([v, Icon, t, d]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={cn(
              "flex gap-4 border p-5 text-left transition-colors",
              value === v
                ? "border-foreground bg-muted"
                : "border-border hover:border-foreground/40",
            )}
          >
            <Icon className="mt-1 h-5 w-5 shrink-0" />
            <span>
              <span className="block font-display text-lg">{t}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{d}</span>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function BeforeYouSubmit({ items }: { items: string[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-l-2 border-foreground/30 pl-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 font-display text-lg"
      >
        Before you submit{" "}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DocUpload({
  value,
  onChange,
  error,
}: {
  value: UploadedDoc | null;
  onChange: (d: UploadedDoc | null) => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [bad, setBad] = useState<string | null>(null);

  useEffect(() => {
    if (!value || value.progress >= 100) return;
    const id = setTimeout(
      () => onChange({ ...value, progress: Math.min(100, value.progress + 25) }),
      180,
    );
    return () => clearTimeout(id);
  }, [value, onChange]);

  const take = (f?: File) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!OK.includes(ext)) {
      setBad("That file type isn't supported. Please upload a DOC, DOCX or PDF.");
      return;
    }
    if (f.size > MAX_DOC_MB * 1024 * 1024) {
      setBad(`That file is larger than ${MAX_DOC_MB} MB. Try saving a smaller copy.`);
      return;
    }
    setBad(null);
    onChange({ name: f.name, ext: ext.toUpperCase(), size: f.size, progress: 0 });
  };
  const msg = bad ?? error;

  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        accept=".doc,.docx,.pdf"
        className="sr-only"
        aria-label="Choose document"
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 border border-foreground p-4">
          <FileText className="h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate font-display text-lg">{value.name}</div>
            <div className="text-xs text-muted-foreground">
              {value.ext} · {fmtSize(value.size)} ·{" "}
              {value.progress < 100 ? `Uploading ${value.progress}%` : "Ready"}
            </div>
            {value.progress < 100 && (
              <div className="mt-2 h-1 bg-muted">
                <div
                  className="h-full bg-foreground transition-all"
                  style={{ width: `${value.progress}%` }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="px-2 py-1 text-sm underline underline-offset-4 hover:text-accent"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove document"
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            take(e.dataTransfer.files[0]);
          }}
          className={cn(
            "border border-dashed px-6 py-10 text-center transition-colors",
            drag
              ? "border-foreground bg-muted"
              : msg
                ? "border-destructive"
                : "border-foreground/30",
          )}
        >
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-lg">Drop your manuscript here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            or{" "}
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="underline underline-offset-4 hover:text-accent"
            >
              choose a file
            </button>
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            DOC, DOCX or PDF · up to {MAX_DOC_MB} MB
          </p>
        </div>
      )}
      {msg && (
        <p className="text-xs text-destructive" role="alert">
          {msg}
        </p>
      )}
    </div>
  );
}

export const guidance = {
  blog: [
    "Give your blog a clear title.",
    "Keep the writing original and your own.",
    "Use clear paragraphs and headings where appropriate.",
    "Make sure the document is readable and complete.",
    "Remove unnecessary personal information.",
    "If you quote or reference someone else's work, provide the source.",
  ],
  creative: [
    "Give the work a clear title.",
    "Select the appropriate writing type.",
    "Make sure the work is complete.",
    "Keep formatting readable.",
    "Make sure the work is your own.",
    "Add a content note if the work contains potentially sensitive themes.",
  ],
  review: [
    "Select the book you are reviewing.",
    "Include a clear review title.",
    "Give your star rating.",
    "Explain your opinion rather than only saying whether you liked/disliked the book.",
    "Avoid spoilers where possible or clearly mark them.",
    "Make sure the review is your own.",
    "If reviewing a book from your personal collection, provide the available book details.",
  ],
} as const;

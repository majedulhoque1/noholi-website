import { ChevronDown, FileText, PenLine, Upload } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export type SubmitMethod = "write" | "upload";
export type UploadedDoc = { name: string; ext: string; size: number; progress: number };

export const MAX_DOC_MB = 10;

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

/**
 * Document upload is coming soon: there is no private storage for manuscripts yet. The drop zone is
 * shown (so the page can be explored) but disabled, and no file is ever accepted, "uploaded" or sent.
 */
export function DocUpload({
  error,
}: {
  value: UploadedDoc | null;
  onChange: (d: UploadedDoc | null) => void;
  error?: string;
}) {
  const { t } = useApp();
  return (
    <div className="space-y-2">
      <input
        type="file"
        accept=".doc,.docx,.pdf"
        className="sr-only"
        aria-label="Choose document"
        disabled
      />
      <div className="border border-dashed border-foreground/30 px-6 py-10 text-center opacity-70">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-display text-lg">{t("forms.soon.upload")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          <button
            type="button"
            disabled
            className="cursor-not-allowed underline underline-offset-4"
          >
            Choose a file
          </button>
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          DOC, DOCX or PDF · up to {MAX_DOC_MB} MB
        </p>
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
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

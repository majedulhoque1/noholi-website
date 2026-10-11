import { Check, Camera, IdCard, ShieldCheck } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DocState = { url: string; name: string } | null;

/** Identity-style capture tile for a portrait or an NID card — not a plain file field. */
export function IdentityUpload({ kind, label, hint, value, onChange, error }: {
  kind: "photo" | "nid"; label: string; hint?: string; value: DocState; onChange: (v: DocState) => void; error?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const Icon = kind === "photo" ? Camera : IdCard;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3"><label htmlFor={id} className="text-sm font-medium">{label}</label><VerifyState state={value ? "uploaded" : "missing"} /></div>
      <button type="button" onClick={() => ref.current?.click()} aria-describedby={hint ? `${id}-h` : undefined}
        className={cn("group relative grid w-full place-items-center overflow-hidden border bg-secondary/60 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          kind === "photo" ? "aspect-square max-w-[180px]" : "aspect-[1.586/1]",
          error ? "border-destructive" : value ? "border-foreground" : "border-dashed border-border")}>
        {value ? (
          <>
            <img src={value.url} alt={`${label} preview`} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-background/90 px-3 py-1.5 text-left text-xs">Replace · <span className="text-muted-foreground">{value.name}</span></span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 p-4 text-center">
            {kind === "nid" ? (
              <span className="relative mb-1 grid h-14 w-24 grid-cols-[28px_1fr] gap-2 rounded-[3px] border border-foreground/30 p-2">
                <span className="rounded-[2px] bg-foreground/15" /><span className="space-y-1.5 pt-1"><span className="block h-1 w-full bg-foreground/15" /><span className="block h-1 w-3/4 bg-foreground/15" /><span className="block h-1 w-1/2 bg-foreground/15" /></span>
              </span>
            ) : <span className="grid h-14 w-14 place-items-center rounded-full border border-foreground/30"><Icon className="h-5 w-5 text-muted-foreground" /></span>}
            <span className="text-sm">{kind === "photo" ? "Add a clear face photo" : "Add front of NID card"}</span>
            <span className="text-xs text-muted-foreground">JPG or PNG · tap to choose</span>
          </span>
        )}
      </button>
      <input id={id} ref={ref} type="file" accept="image/*" className="sr-only" tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange({ url: URL.createObjectURL(f), name: f.name }); }} />
      {hint && <p id={`${id}-h`} className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function VerifyState({ state }: { state: "verified" | "uploaded" | "missing" }) {
  if (state === "verified") return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ShieldCheck className="h-3.5 w-3.5" /> Verified on file</span>;
  if (state === "uploaded") return <span className="inline-flex items-center gap-1 text-xs font-medium"><Check className="h-3.5 w-3.5" /> Added · verified at desk</span>;
  return <span className="text-xs text-muted-foreground">Required</span>;
}

export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn("grid gap-0", className)} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }} aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? "step" : undefined} className={cn("border-t-2 pt-3 pr-2 text-xs transition-colors", i < current ? "border-foreground" : i === current ? "border-accent" : "border-border text-muted-foreground")}>
          <span className="tabular-nums text-muted-foreground">0{i + 1}</span>
          <span className={cn("mt-0.5 hidden sm:block", i === current && "font-medium")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function SummaryBlock({ title, children, onEdit }: { title: string; children: ReactNode; onEdit?: () => void }) {
  return (
    <section className="border-t border-border py-6">
      <div className="mb-4 flex items-baseline justify-between"><h3 className="eyebrow">{title}</h3>{onEdit && <button type="button" onClick={onEdit} className="text-sm underline underline-offset-4 hover:text-accent">Edit</button>}</div>
      {children}
    </section>
  );
}

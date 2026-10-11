import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Req() { return <span className="ml-1 text-xs font-normal text-accent">Required</span>; }
export function Opt() { return <span className="ml-1 text-xs font-normal text-muted-foreground">Optional</span>; }

export function Chips({ options, value, onChange, multi }: { options: string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => { const on = value.includes(o); return (
        <button key={o} type="button" aria-pressed={on} onClick={() => onChange(multi ? (on ? value.filter((x) => x !== o) : [...value, o]) : [o])}
          className={cn("h-8 rounded-full border px-3 text-sm transition-colors", on ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40")}>{o}</button>); })}
    </div>
  );
}

export function More({ label: l, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border pt-4">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent">{l}<ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} /></button>
      {open && <div className="mt-5">{children}</div>}
    </div>
  );
}


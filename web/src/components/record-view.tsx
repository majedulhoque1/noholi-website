import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { fmtDate, StatusBadge } from "@/components/noholi";
import type { RecordEvent } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Shared pattern for every member "View Details" page: header, labelled sections, timeline, actions. */

/** Returns to the list the member came from; falls back to the record's own list on a direct visit. */
export function BackLink({ to, search, label }: { to: string; search?: Record<string, string>; label: string }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <Link
      to={to}
      search={search}
      onClick={(e) => { if (canGoBack) { e.preventDefault(); router.history.back(); } }}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}

export function RecordHeader({ back, eyebrow, title, ids, status, statusNote, dates }: {
  back: ReactNode; eyebrow: string; title: ReactNode; ids: { label: string; value: string }[];
  status: string; statusNote?: ReactNode; dates: { label: string; value?: string }[];
}) {
  return (
    <header className="border-b border-foreground pb-6">
      {back}
      <div className="eyebrow mt-6">{eyebrow}</div>
      <h1 className="mt-2 text-4xl leading-tight md:text-5xl">{title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <StatusBadge status={status} className="text-sm" />
        {ids.map((i) => <span key={i.label}><span className="text-muted-foreground">{i.label} </span><span className="font-mono">{i.value}</span></span>)}
        {dates.filter((d) => d.value).map((d) => <span key={d.label}><span className="text-muted-foreground">{d.label} </span>{fmtDate(d.value!)}</span>)}
      </div>
      {statusNote && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{statusNote}</p>}
    </header>
  );
}

/** A labelled section: title on the left, label/value rows on the right. Divided by rules, not cards. */
export function Section({ n, title, children, aside }: { n?: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-border py-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div>{n && <div className="eyebrow">{n}</div>}<h2 className="mt-1 text-2xl">{title}</h2>{aside}</div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export type Row = [label: string, value: ReactNode | undefined | null | false];
/** Rows with empty values are skipped, so only fields that exist are shown. */
export function Fields({ rows, className }: { rows: Row[]; className?: string }) {
  const shown = rows.filter(([, v]) => v !== undefined && v !== null && v !== false && v !== "");
  return (
    <dl className={cn("grid gap-x-8 sm:grid-cols-2", className)}>
      {shown.map(([l, v]) => (
        <div key={l} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 border-b border-border/60 py-2.5 text-sm last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
          <dt className="text-muted-foreground">{l}</dt><dd className="min-w-0 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({ events }: { events: RecordEvent[] }) {
  return (
    <ol className="relative ml-1.5 border-l border-border">
      {events.map((e, i) => (
        <li key={i} className="relative pb-5 pl-6 last:pb-0">
          <span className={cn("absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-foreground", i === events.length - 1 ? "bg-foreground" : "bg-background")} />
          <div className="text-sm font-medium">{e.label}</div>
          <div className="text-xs text-muted-foreground">{fmtDate(e.date)}</div>
          {e.note && <p className="mt-1 text-sm text-muted-foreground">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}

export const maskNid = (last4?: string) => (last4 ? `•••• •••• •••• ${last4}` : undefined);

/** Small "View details" text link used in every list. */
export function DetailsLink({ children = "View details", to, params }: { to: string; params?: Record<string, string>; children?: ReactNode }) {
  return <Link to={to} params={params as never} className="inline-flex items-center gap-1 whitespace-nowrap text-sm underline underline-offset-4 hover:text-accent">{children}</Link>;
}

export function NotFoundRecord({ what, back }: { what: string; back: ReactNode }) {
  return <div className="py-16">{back}<h1 className="mt-6 text-4xl">{what} not found</h1><p className="mt-2 text-muted-foreground">This record doesn't exist or isn't part of your account.</p></div>;
}

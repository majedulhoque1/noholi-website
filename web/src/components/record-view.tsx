import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Cover, fmtDate, StatusBadge } from "@/components/noholi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecordEvent } from "@/lib/data";
import { coverUrl, toneOf, type BookLite } from "@/lib/lending";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Shared pattern for every member "View Details" page: header, labelled sections, timeline, actions. */

/** Returns to the list the member came from; falls back to the record's own list on a direct visit. */
export function BackLink({
  to,
  search,
  label,
}: {
  to: string;
  search?: Record<string, string>;
  label: string;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <Link
      to={to}
      search={search}
      onClick={(e) => {
        if (canGoBack) {
          e.preventDefault();
          router.history.back();
        }
      }}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}

export function RecordHeader({
  back,
  eyebrow,
  title,
  ids,
  status,
  statusNote,
  dates,
  statusBadge,
  formatDate = fmtDate,
}: {
  back: ReactNode;
  eyebrow: string;
  title: ReactNode;
  ids: { label: string; value: string }[];
  status: string;
  statusNote?: ReactNode;
  dates: { label: string; value?: string }[];
  /** Replaces the default StatusBadge (e.g. a translated ToneBadge). */
  statusBadge?: ReactNode;
  /** Date formatter; defaults to the prototype's fmtDate. */
  formatDate?: (d: string) => string;
}) {
  return (
    <header className="border-b border-foreground pb-6">
      {back}
      <div className="eyebrow mt-6">{eyebrow}</div>
      <h1 className="mt-2 break-words text-4xl leading-tight md:text-5xl">{title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {statusBadge ?? <StatusBadge status={status} className="text-sm" />}
        {ids.map((i) => (
          <span key={i.label}>
            <span className="text-muted-foreground">{i.label} </span>
            <span className="font-mono">{i.value}</span>
          </span>
        ))}
        {dates
          .filter((d) => d.value)
          .map((d) => (
            <span key={d.label}>
              <span className="text-muted-foreground">{d.label} </span>
              {formatDate(d.value!)}
            </span>
          ))}
      </div>
      {statusNote && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{statusNote}</p>}
    </header>
  );
}

/** A labelled section: title on the left, label/value rows on the right. Divided by rules, not cards. */
export function Section({
  n,
  title,
  children,
  aside,
}: {
  n?: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="grid gap-4 border-b border-border py-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div>
        {n && <div className="eyebrow">{n}</div>}
        <h2 className="mt-1 text-2xl">{title}</h2>
        {aside}
      </div>
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
        <div
          key={l}
          className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 border-b border-border/60 py-2.5 text-sm last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
        >
          <dt className="text-muted-foreground">{l}</dt>
          <dd className="min-w-0 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({
  events,
  formatDate = fmtDate,
}: {
  events: RecordEvent[];
  formatDate?: (d: string) => string;
}) {
  return (
    <ol className="relative ml-1.5 border-l border-border">
      {events.map((e, i) => (
        <li key={i} className="relative pb-5 pl-6 last:pb-0">
          <span
            className={cn(
              "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-foreground",
              i === events.length - 1 ? "bg-foreground" : "bg-background",
            )}
          />
          <div className="text-sm font-medium">{e.label}</div>
          <div className="text-xs text-muted-foreground">{formatDate(e.date)}</div>
          {e.note && <p className="mt-1 text-sm text-muted-foreground">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}

export const maskNid = (last4?: string) => (last4 ? `•••• •••• •••• ${last4}` : undefined);

/** Small "View details" text link used in every list. */
export function DetailsLink({
  children = "View details",
  to,
  params,
}: {
  to: string;
  params?: Record<string, string>;
  children?: ReactNode;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className="inline-flex items-center gap-1 whitespace-nowrap text-sm underline underline-offset-4 hover:text-accent"
    >
      {children}
    </Link>
  );
}

export function NotFoundRecord({
  what,
  back,
  title,
  body,
}: {
  what: string;
  back: ReactNode;
  /** Overrides the default English heading (for translated pages). */
  title?: string;
  body?: string;
}) {
  return (
    <div className="py-16">
      {back}
      <h1 className="mt-6 text-4xl">{title ?? `${what} not found`}</h1>
      <p className="mt-2 text-muted-foreground">
        {body ?? "This record doesn't exist or isn't part of your account."}
      </p>
    </div>
  );
}

// ---- Shared by the real-data lending pages (loans, requests, fines, dashboard) ----

const toneClass = {
  ok: ["text-success", "bg-success"],
  bad: ["text-destructive", "bg-destructive"],
  pending: ["text-foreground", "border border-foreground"],
  muted: ["text-muted-foreground", "bg-muted-foreground/50"],
} as const;
export type Tone = keyof typeof toneClass;

/** Status label with an explicit tone, so the text can be translated (StatusBadge keys on English). */
export function ToneBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  const [text, dot] = toneClass[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium",
        text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

/** The real cover from the `covers` bucket, or the drawn cover when there is none (or it fails to load). */
export function BookThumb({
  book,
  fallbackTitle,
  size = "sm",
  className,
}: {
  book: BookLite | null;
  fallbackTitle: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { lang } = useApp();
  const [broken, setBroken] = useState(false);
  const url = broken ? null : coverUrl(book?.thumbnail);
  if (url)
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className={cn(
          "aspect-[2/3] w-full rounded-[2px] bg-muted object-cover shadow-book",
          className,
        )}
      />
    );
  const title = book
    ? lang === "bn" && book.title_bangla
      ? book.title_bangla
      : book.title
    : fallbackTitle;
  const author = book
    ? lang === "bn" && book.author_bangla
      ? book.author_bangla
      : book.author
    : "";
  return (
    <Cover
      title={title}
      author={author}
      tone={toneOf(book?.id ?? fallbackTitle)}
      size={size}
      className={className}
    />
  );
}

/** Placeholder rows while a list loads. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true" className="divide-y divide-border border-y border-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[56px_minmax(0,1fr)] gap-5 py-5">
          <Skeleton className="aspect-[2/3] w-full" />
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A failed fetch: the real reason plus a retry. Distinct from an empty list. */
export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
}: {
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="border border-destructive/40 px-6 py-12 text-center">
      <h3 className="text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md break-words text-sm text-muted-foreground">{message}</p>
      <Button className="mt-6" variant="outline" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}

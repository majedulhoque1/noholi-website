import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Empty, fmtDate, Stars, StatusBadge } from "@/components/noholi";
import { DetailsLink } from "@/components/record-view";
import type { Contribution } from "@/lib/data";
import { cn } from "@/lib/utils";

export const kindLabel = { blog: "Blog", creative: "Creative Writing", review: "Book Review" } as const;
export const statusFilters = ["All", "Draft", "Pending Review", "Published", "Needs Revision", "Rejected"] as const;
export const matchStatus = (s: string, c: Contribution) =>
  s === "All" || (s === "Published" ? c.status === "Published" || c.status === "Approved" : c.status === s);

/** Pill row of filters; each pill is a link so the filter lives in the address and survives Back. */
export function FilterPills({ label, items, active, href }: { label: string; items: { key: string; text: string; count: number }[]; active: string; href: (key: string) => { to: string; search: Record<string, string> } }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="mr-1 text-xs text-muted-foreground">{label}</span>
      {items.map((i) => { const h = href(i.key); return (
        <Link key={i.key} to={h.to} search={h.search as never} aria-current={active === i.key ? "true" : undefined}
          className={cn("rounded-full border px-3 py-1 text-sm", active === i.key ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50")}>
          {i.text} <span className="tabular-nums opacity-60">{i.count}</span>
        </Link>); })}
    </div>
  );
}

export function ContributionRows({ list, showKind = true, emptyBody }: { list: Contribution[]; showKind?: boolean; emptyBody: string }) {
  if (!list.length) return <div className="mt-8"><Empty title="Nothing in this list yet." body={emptyBody} action={<Button variant="outline" asChild><Link to="/writeups">Explore Write Ups</Link></Button>} /></div>;
  return (
    <ul className="mt-6 divide-y divide-border border-y border-border">
      <li className="hidden grid-cols-[minmax(0,1fr)_110px_110px_150px_100px] gap-5 py-3 text-xs text-muted-foreground md:grid"><span>Title</span><span>Submitted</span><span>Last updated</span><span>Status</span><span /></li>
      {list.map((c) => (
        <li key={c.id} className="grid gap-1.5 py-5 md:grid-cols-[minmax(0,1fr)_110px_110px_150px_100px] md:items-center md:gap-5">
          <div className="min-w-0">
            <div className="eyebrow">{showKind && kindLabel[c.kind]}{showKind && c.bookTitle && " · "}{c.bookTitle}</div>
            <div className="mt-1 break-words font-display text-xl leading-snug">{c.title}</div>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground"><span className="font-mono">{c.id}</span>{c.rating ? <Stars n={c.rating} /> : null}</div>
          </div>
          <span className="text-sm"><span className="text-muted-foreground md:hidden">Submitted </span>{c.submitted ? fmtDate(c.submitted) : "Not yet"}</span>
          <span className="text-sm"><span className="text-muted-foreground md:hidden">Updated </span>{fmtDate(c.updated)}</span>
          <StatusBadge status={c.status} />
          <div className="md:text-right"><DetailsLink to="/account/contributions/$id" params={{ id: c.id }} /></div>
        </li>
      ))}
    </ul>
  );
}

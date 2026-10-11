import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { BookCover, Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { DetailsLink } from "@/components/record-view";
import { getBook, loans, type Loan } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/borrowed")({
  validateSearch: z.object({ tab: z.enum(["current", "history"]).optional() }),
  head: () => ({ meta: [{"title": "Borrowed books \u2014 My Noholi"}, {"name": "description", "content": "View your current Noholi loans, return dates and borrow history."}, {"property": "og:title", "content": "Borrowed books \u2014 My Noholi"}, {"property": "og:description", "content": "View your current Noholi loans, return dates and borrow history."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: Borrowed,
});

function Rows({ list, history }: { list: Loan[]; history?: boolean }) {
  if (!list.length) return <Empty title="Nothing here" body="No books in this list. Your next favourite is waiting on the shelf." action={<Button variant="outline" asChild><Link to="/library/books">Browse books</Link></Button>} />;
  const cols = history ? "md:grid-cols-[56px_minmax(0,1fr)_110px_110px_110px_100px_100px]" : "md:grid-cols-[56px_minmax(0,1fr)_110px_110px_110px_100px]";
  return (
    <div className="divide-y divide-border border-y border-border">
      <div className={cn("hidden gap-5 py-3 text-xs text-muted-foreground md:grid", cols)}><span /><span>Book</span><span>Issued</span><span>Due</span>{history && <span>Returned</span>}<span>Status</span><span /></div>
      {list.map((l) => { const b = getBook(l.bookId)!; return (
        <div key={l.id} className={cn("grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-5 gap-y-1.5 py-5", cols)}>
          <BookCover book={b} size="sm" />
          <div className="min-w-0"><Link to="/book/$id" params={{ id: b.id }} className="font-display text-lg hover:text-accent">{b.titleEn}</Link><div className="truncate text-sm text-muted-foreground">{b.authorEn}</div><div className="font-mono text-xs text-muted-foreground">{l.id}</div></div>
          <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Issued </span>{fmtDate(l.issued)}</span>
          <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Due </span>{fmtDate(l.due)}</span>
          {history && <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Returned </span>{l.returned ? fmtDate(l.returned) : "—"}</span>}
          <span className="col-start-2 md:col-start-auto"><StatusBadge status={l.status} /></span>
          <div className="col-start-2 md:col-start-auto md:text-right"><DetailsLink to="/account/requests/$id" params={{ id: l.requestId }} /></div>
        </div>); })}
    </div>
  );
}

function Borrowed() {
  const { tab = "current" } = Route.useSearch();
  const current = loans.filter((l) => l.status === "Active" || l.status === "Overdue");
  const history = loans.filter((l) => l.status === "Returned" || l.status === "Lost");
  return (
    <>
      <h1 className="text-4xl">Borrowed books</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">Books that have been handed to you. Requests still being reviewed are under <Link to="/account/requests" className="underline underline-offset-2">Borrow Requests</Link>.</p>
      <nav className="mb-8 flex gap-2" aria-label="Borrowed books">
        {([["current", "Current Loans", current.length], ["history", "Borrow History", history.length]] as const).map(([v, l, n]) => (
          <Link key={v} to="/account/borrowed" search={v === "current" ? {} : { tab: v }} aria-current={tab === v ? "page" : undefined} className={cn("rounded-full border px-4 py-1.5 text-sm", tab === v ? "border-foreground bg-foreground text-background" : "border-border")}>{l} <span className="tabular-nums opacity-60">{n}</span></Link>
        ))}
      </nav>
      {tab === "current" ? <Rows list={current} /> : <Rows list={history} history />}
    </>
  );
}

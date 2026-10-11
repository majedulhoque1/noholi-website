import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookCover, Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { DetailsLink } from "@/components/record-view";
import { getBook } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/requests")({
  head: () => ({ meta: [{ title: "Borrow requests — My Noholi" }, { name: "description", content: "Track your Noholi borrow requests." },
      { property: "og:title", content: "Borrow requests — My Noholi" },
      { property: "og:description", content: "Track your Noholi borrow requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] }),
  component: Requests,
});

const filters = ["Open", "All", "Past"] as const;
const open = ["Pending Review", "Approved", "Ready for Pickup"];
const hint: Record<string, string> = {
  "Ready for Pickup": "Approved — collect from the front desk with your NID",
  "Pending Review": "Usually 1–2 working days",
  Approved: "Approved — not issued yet",
};

function Requests() {
  const { borrowRequests } = useApp();
  const [f, setF] = useState<(typeof filters)[number]>("Open");
  const list = borrowRequests.filter((r) => f === "All" || (f === "Open" ? open.includes(r.status) : !open.includes(r.status)));
  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div><h1 className="text-4xl">Borrow requests</h1><p className="mt-2 text-sm text-muted-foreground">Borrowing is free. Each request is checked by the librarian; once the book is handed over, it becomes a loan under Borrowed Books.</p></div>
        <div className="flex gap-2">{filters.map((x) => <button key={x} onClick={() => setF(x)} aria-pressed={f === x} className={cn("h-8 rounded-full border px-4 text-sm", f === x ? "border-foreground bg-foreground text-background" : "border-border")}>{x}</button>)}</div>
      </div>
      {list.length === 0 ? (
        <Empty title="No borrow requests here." body="Find a book on the shelves and choose Borrow to send a request." action={<Button asChild><Link to="/library/books">Browse books</Link></Button>} />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          <li className="hidden grid-cols-[56px_minmax(0,1fr)_120px_120px_170px_100px] gap-5 py-3 text-xs text-muted-foreground md:grid"><span /><span>Book</span><span>Submitted</span><span>Last updated</span><span>Status</span><span /></li>
          {list.map((r) => { const b = getBook(r.bookId)!; return (
            <li key={r.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-5 gap-y-1.5 py-5 md:grid-cols-[56px_minmax(0,1fr)_120px_120px_170px_100px] md:items-center">
              <BookCover book={b} size="sm" />
              <div className="min-w-0">
                <div className="truncate font-display text-xl">{b.titleEn}</div>
                <div className="truncate text-sm text-muted-foreground">{b.authorEn} · {r.copy}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{r.id}</div>
              </div>
              <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Submitted </span>{fmtDate(r.submitted)}</span>
              <span className="col-start-2 text-sm md:col-start-auto"><span className="text-muted-foreground md:hidden">Updated </span>{fmtDate(r.updated)}</span>
              <div className="col-start-2 md:col-start-auto"><StatusBadge status={r.status} /><div className="mt-1 text-xs text-muted-foreground">{r.loanId ? `Loan ${r.loanId}` : hint[r.status] ?? ""}</div></div>
              <div className="col-start-2 md:col-start-auto md:text-right"><DetailsLink to="/account/requests/$id" params={{ id: r.id }} /></div>
            </li>); })}
        </ul>
      )}
    </>
  );
}

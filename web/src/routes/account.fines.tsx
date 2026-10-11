import { createFileRoute } from "@tanstack/react-router";
import { fmtDate, StatusBadge, taka } from "@/components/noholi";
import { DetailsLink } from "@/components/record-view";
import { fineOutstanding, fines, getBook, getLoan, loans } from "@/lib/data";

export const Route = createFileRoute("/account/fines")({ head: () => ({ meta: [{"title": "Overdue & Fines \u2014 My Noholi"}, {"name": "description", "content": "Review overdue loans and library fine information at Noholi."}, {"property": "og:title", "content": "Overdue & Fines \u2014 My Noholi"}, {"property": "og:description", "content": "Review overdue loans and library fine information at Noholi."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }), component: Fines });

function Fines() {
  const total = fines.reduce((s, f) => s + fineOutstanding(f), 0);
  const overdue = loans.filter((l) => l.status === "Overdue");

  return (
    <>
      <h1 className="text-4xl">Overdue &amp; Fines</h1>
      <p className="mb-8 mt-2 max-w-2xl text-sm text-muted-foreground">Borrowing is always free. Fines only apply to late returns, damage or loss, according to library policy. Please settle any fine at the front desk — there are no online payments.</p>
      <div className="grid gap-6 border-y border-foreground py-8 md:grid-cols-2">
        <div><div className="eyebrow">Outstanding</div><div className="mt-2 font-display text-6xl">{taka(total)}</div><div className="mt-1 text-sm text-muted-foreground">{total ? "Amounts are set by the library and recorded here." : "No outstanding fines. Thank you!"}</div></div>
        <div><div className="eyebrow">Overdue now</div>
          {overdue.length ? <ul className="mt-3 space-y-2 text-sm">{overdue.map((l) => <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2"><span><span className="font-display text-lg">{getBook(l.bookId)!.titleEn}</span> <span className="text-muted-foreground">· due {fmtDate(l.due)}</span></span><DetailsLink to="/account/requests/$id" params={{ id: l.requestId }}>Loan {l.id}</DetailsLink></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">Nothing overdue.</p>}
        </div>
      </div>
      <table className="mt-10 w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-3 font-normal">Fine</th><th className="font-normal">Book</th><th className="hidden font-normal md:table-cell">Reason</th><th className="hidden font-normal sm:table-cell">Due date</th><th className="font-normal">Amount</th><th className="hidden font-normal sm:table-cell">Outstanding</th><th className="font-normal">Status</th><th /></tr></thead>
        <tbody>
          {fines.map((f) => { const out = fineOutstanding(f); return (
            <tr key={f.id} className="border-b border-border">
              <td className="py-4 font-mono text-xs text-muted-foreground">{f.id}</td>
              <td className="font-display text-base">{getBook(f.bookId)!.titleEn}</td>
              <td className="hidden md:table-cell">{f.reason}{f.overdueDays ? ` · ${f.overdueDays} days` : ""}</td>
              <td className="hidden sm:table-cell">{fmtDate(getLoan(f.loanId)?.due ?? f.date)}</td>
              <td className="tabular-nums">{taka(f.amount)}</td>
              <td className="hidden tabular-nums sm:table-cell">{taka(out)}</td>
              <td><StatusBadge status={out > 0 ? "Due" : "Cleared"} /></td>
              <td className="text-right"><DetailsLink to="/account/fines/$id" params={{ id: f.id }}>Details</DetailsLink></td>
            </tr>); })}
        </tbody>
      </table>
    </>
  );
}

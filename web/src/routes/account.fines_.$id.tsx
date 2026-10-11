import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookCover, fmtDate, taka } from "@/components/noholi";
import { BackLink, Fields, NotFoundRecord, RecordHeader, Section } from "@/components/record-view";
import { fineOutstanding, fines, getBook, getLoan } from "@/lib/data";

export const Route = createFileRoute("/account/fines_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Fine — My Noholi` },
      { name: "description", content: "Details and payment history for a Noholi library fine." },
      { property: "og:title", content: `${params.id} — Fine` },
      {
        property: "og:description",
        content: "Details and payment history for a Noholi library fine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FineDetail,
});

function FineDetail() {
  const { id } = Route.useParams();
  const f = fines.find((x) => x.id === id);
  const back = <BackLink to="/account/fines" label="Back to Overdue & Fines" />;
  if (!f) return <NotFoundRecord what="Fine" back={back} />;
  const book = getBook(f.bookId)!,
    loan = getLoan(f.loanId),
    out = fineOutstanding(f);
  return (
    <article className="max-w-5xl">
      <RecordHeader
        back={back}
        eyebrow="Fine"
        title={f.reason}
        ids={[{ label: "Fine", value: f.id }]}
        status={out > 0 ? "Due" : "Cleared"}
        statusNote={
          out > 0
            ? "Please settle this at the front desk. Noholi doesn't take payments online."
            : "Fully settled — see the recorded payments below."
        }
        dates={[{ label: "Recorded", value: f.date }]}
      />
      <Section n="A" title="Related loan">
        <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-5">
          <BookCover book={book} size="sm" />
          <div className="min-w-0">
            <div className="font-display text-lg">{book.titleEn}</div>
            <Fields
              className="mt-2"
              rows={[
                [
                  "Loan ID",
                  loan && (
                    <Link
                      to="/account/requests/$id"
                      params={{ id: loan.requestId }}
                      className="font-mono underline underline-offset-4 hover:text-accent"
                    >
                      {loan.id}
                    </Link>
                  ),
                ],
                ["Due date", loan && fmtDate(loan.due)],
                ["Returned", loan?.returned && fmtDate(loan.returned)],
                [
                  "Overdue",
                  f.overdueDays ? `${f.overdueDays} days (as recorded by the library)` : undefined,
                ],
              ]}
            />
          </div>
        </div>
      </Section>
      <Section n="B" title="Amount">
        <Fields
          rows={[
            ["Fine amount", taka(f.amount)],
            ["Paid", taka(f.amount - out)],
            ["Outstanding", <strong>{taka(out)}</strong>],
          ]}
        />
      </Section>
      <Section n="C" title="Payments">
        {f.payments.length ? (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 font-normal">Date</th>
                <th className="font-normal">Amount</th>
                <th className="font-normal">Method</th>
                <th className="font-normal">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {f.payments.map((p) => (
                <tr key={p.receipt} className="border-b border-border/60">
                  <td className="py-2.5">{fmtDate(p.date)}</td>
                  <td className="tabular-nums">{taka(p.amount)}</td>
                  <td>{p.method}</td>
                  <td className="font-mono text-xs">{p.receipt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        )}
      </Section>
      <div className="flex flex-wrap gap-2 py-8">
        <Button variant="outline" asChild>
          <Link to="/contact">Contact Library</Link>
        </Button>
      </div>
    </article>
  );
}

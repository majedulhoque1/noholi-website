import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookCover, fmtDate, Initials, MemberAvatar, StatusBadge, taka } from "@/components/noholi";
import { BackLink, Fields, maskNid, NotFoundRecord, RecordHeader, Section, Timeline } from "@/components/record-view";
import { fineOutstanding, fines, getBook, getLoan, loans } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/requests_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Borrow record — My Noholi` },
      { name: "description", content: "Details, guarantor and timeline for one of your Noholi borrow requests or loans." },
      { property: "og:title", content: `${params.id} — Borrow record` },
      { property: "og:description", content: "Details, guarantor and timeline for one of your Noholi borrow records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BorrowRecord,
});

const statusNote: Record<string, string> = {
  "Pending Review": "The librarian is checking your details and your guarantor's. This usually takes 1–2 working days.",
  Approved: "Approved — the book hasn't been issued yet.",
  "Ready for Pickup": "Approved and set aside. Collect it from the front desk with your NID. The loan starts when the book is handed to you.",
  Rejected: "This request was not approved. See the timeline for the library's note.",
  Cancelled: "You cancelled this request.",
};

function BorrowRecord() {
  const { id } = Route.useParams();
  const { borrowRequests, cancelBorrowRequest } = useApp();
  // A loan ID resolves to the request it came from — one record, one guarantor.
  const req = borrowRequests.find((r) => r.id === id) ?? borrowRequests.find((r) => r.id === loans.find((l) => l.id === id)?.requestId);
  const back = <BackLink to="/account/requests" label="Back" />;
  if (!req) return <NotFoundRecord what="Borrow record" back={back} />;
  const book = getBook(req.bookId)!;
  const loan = getLoan(req.loanId);
  const fine = loan && fines.find((f) => f.loanId === loan.id);
  const g = req.guarantor, m = req.member;

  return (
    <article className="max-w-5xl">
      <RecordHeader
        back={back}
        eyebrow={loan ? "Loan record" : "Borrow request"}
        title={book.titleEn}
        ids={[{ label: "Request", value: req.id }, ...(loan ? [{ label: "Loan", value: loan.id }] : [])]}
        status={loan ? loan.status : req.status}
        statusNote={loan ? <>Request status: <StatusBadge status={req.status} /> — the book was handed over on {fmtDate(loan.issued)}.</> : statusNote[req.status]}
        dates={[{ label: "Submitted", value: req.submitted }, { label: "Last updated", value: req.updated }]}
      />

      <Section n="A" title="Book">
        <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-5">
          <BookCover book={book} size="sm" />
          <div className="min-w-0">
            <div className="font-bangla text-xl">{book.titleBn}</div>
            <div className="font-display text-lg">{book.titleEn}</div>
            <Fields className="mt-3" rows={[["Author", book.authorEn], ["Book ID", <span className="font-mono">{book.id}</span>], ["Genre", `${book.genre} · ${book.category}`], ["Language", book.language], ["Publication", `${book.publisher}, ${book.year}`], ["Copy", req.copy]]} />
            <Link to="/book/$id" params={{ id: book.id }} className="mt-3 inline-block text-sm underline underline-offset-4 hover:text-accent">Open book page</Link>
          </div>
        </div>
      </Section>

      <Section n="B" title="Borrowing">
        <Fields rows={[
          ["Request date", fmtDate(req.submitted)],
          ["Approval", req.status === "Pending Review" ? "Awaiting review" : req.status === "Rejected" ? "Not approved" : req.status === "Cancelled" ? "Cancelled before review" : "Approved"],
          ["Issue date", loan && fmtDate(loan.issued)],
          [loan ? "Due date" : "Requested return by", fmtDate(loan ? loan.due : req.due)],
          ["Returned", loan?.returned && fmtDate(loan.returned)],
          ["Loan status", loan && <StatusBadge status={loan.status} />],
          ["Borrowing fee", "৳0 — borrowing is free"],
          ["Fine", fine ? <Link to="/account/fines/$id" params={{ id: fine.id }} className="underline underline-offset-4 hover:text-accent">{fine.id} · {taka(fine.amount)} · {fineOutstanding(fine) > 0 ? `${taka(fineOutstanding(fine))} outstanding` : "settled"}</Link> : loan ? "None recorded" : undefined],
          ["Your note", req.notes],
        ]} />
      </Section>

      <Section n="C" title="Member" aside={<p className="mt-2 text-xs text-muted-foreground">As recorded when this request was made.</p>}>
        <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-5">
          <MemberAvatar className="h-14 w-14" textClass="text-2xl" />
          <Fields rows={[["Full name", m.name], ["Member ID", <span className="font-mono">{m.memberId}</span>], ["Phone", m.phone], ["Email", m.email], ["Address", m.address], ["Verification", <span className="text-success">● {m.verification}</span>]]} />
        </div>
      </Section>

      <Section n="D" title="Guarantor" aside={<p className="mt-2 text-xs text-muted-foreground">The guarantor for this record. Read-only.</p>}>
        <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-5">
          <Initials name={g.name} className="h-14 w-14 text-2xl" />
          <div className="min-w-0">
            <Fields rows={[["Full name", g.name], ["Relationship", g.relation], ["Phone", g.phone], ["Email", g.email], ["Address", g.address], ["NID", maskNid(g.nidLast4)], ["Status", g.status]]} />
            <p className="mt-3 text-xs text-muted-foreground">NID numbers are masked and identity photos are never shown here. Only library staff can view identity documents.</p>
          </div>
        </div>
      </Section>

      <Section n="E" title="Timeline"><Timeline events={req.timeline} /></Section>

      <div className="flex flex-wrap gap-2 py-8">
        <Button variant="outline" asChild><Link to="/book/$id" params={{ id: book.id }}>View Book</Link></Button>
        <Button variant="outline" asChild><Link to="/contact">Contact Library</Link></Button>
        {req.status === "Pending Review" && <Button variant="ghost" className="text-destructive" onClick={() => cancelBorrowRequest(req.id)}>Cancel Request</Button>}
        {(req.status === "Pending Review" || req.status === "Approved") && <Button variant="ghost" onClick={() => toast("Update requested", { description: "Prototype — the librarian would be notified." })}>Request an Update</Button>}
      </div>
    </article>
  );
}

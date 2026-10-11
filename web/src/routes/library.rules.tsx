import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/noholi";

export const Route = createFileRoute("/library/rules")({
  head: () => ({
    meta: [
      { title: "Library Rules — Noholi Library" },
      { name: "description", content: "How membership, borrowing, returns and conduct work at Noholi Library." },
      { property: "og:title", content: "Library Rules — Noholi Library" },
      { property: "og:description", content: "Our library rules help keep Noholi welcoming, accessible, and fair to everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rules,
});

const TBC = "Details to be confirmed by Noholi Library.";

/** Only statements already true in the prototype are written as facts; everything else stays a placeholder. */
const sections: { id: string; title: string; body: string[]; pending?: boolean }[] = [
  { id: "membership", title: "Membership", body: ["Membership at Noholi is free. There is no joining or monthly fee.", `Eligibility and renewal of membership: ${TBC}`] },
  { id: "borrowing", title: "Borrowing Books", body: ["Members borrow printed books by sending a Borrow Request from the book's page. Each request is reviewed by the library before a book is set aside.", "Borrowing is free. No payment is taken at any step."] },
  { id: "loan", title: "Loan Period and Renewals", body: [TBC], pending: true },
  { id: "returns", title: "Returns", body: [TBC], pending: true },
  { id: "overdue", title: "Overdue Books and Fines", body: ["Overdue books are shown in your account under Overdue & Fines. No fine can be paid online.", `Any fine amounts and how they apply: ${TBC}`] },
  { id: "care", title: "Book Care", body: [TBC], pending: true },
  { id: "lost", title: "Lost or Damaged Books", body: [TBC], pending: true },
  { id: "guarantor", title: "Guarantor and Identification", body: ["A Borrow Request asks for your identification and guarantor details so the library can review it.", `Which documents are accepted and who can act as a guarantor: ${TBC}`] },
  { id: "digital", title: "E-Books and Audio Books", body: ["Members can read e-books in the browser and listen to audio books on the Noholi website.", `Access limits and availability: ${TBC}`] },
  { id: "conduct", title: "Member Conduct", body: [TBC], pending: true },
  { id: "privacy", title: "Privacy", body: [TBC], pending: true },
  { id: "contact", title: "Contact and Questions", body: ["If anything here is unclear, ask at the front desk or send us a message — we're glad to help."] },
];

function Rules() {
  return (
    <>
      <PageIntro eyebrow="Library / Rules" title="A shared space for every reader.">
        Our library rules help keep Noholi welcoming, accessible, and fair to everyone.
      </PageIntro>
      <section className="container-page grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Contents" className="lg:sticky lg:top-[calc(var(--hdr,109px)+1.5rem)] lg:self-start">
          <details className="border-y border-border py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">Contents</summary>
            <Toc />
          </details>
          <div className="hidden lg:block"><div className="eyebrow mb-3">Contents</div><Toc /></div>
        </nav>
        <div className="max-w-2xl">
          <p className="mb-10 border-l-2 border-accent pl-4 text-sm text-muted-foreground">Sections marked “to be confirmed” are not yet official policy. Please check with the library before relying on them.</p>
          <ol className="divide-y divide-border border-y border-border">
            {sections.map((s, i) => (
              <li key={s.id} id={s.id} className="scroll-mt-32 py-8">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
                  <span className="font-display text-xl text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl">{s.title}</h2>
                    {s.body.map((p) => <p key={p} className={`mt-3 font-display text-lg leading-relaxed ${s.pending ? "italic text-muted-foreground" : ""}`}>{p}</p>)}
                    {s.id === "contact" && <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:text-accent">Contact the library <ArrowRight className="h-4 w-4" /></Link>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
            <p className="font-display text-2xl">Ready to find your next read?</p>
            <Button size="lg" asChild><Link to="/library/books">Explore the Library <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Toc() {
  return (
    <ol className="mt-3 space-y-1.5 text-sm">
      {sections.map((s, i) => (
        <li key={s.id}><a href={`#${s.id}`} className="grid grid-cols-[1.75rem_minmax(0,1fr)] text-muted-foreground hover:text-foreground"><span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>{s.title}</a></li>
      ))}
    </ol>
  );
}

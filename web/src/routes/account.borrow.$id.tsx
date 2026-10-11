import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Availability, BookCover, fmtDate, Initials, StatusBadge, MemberAvatar } from "@/components/noholi";
import { IdentityUpload, Stepper, SummaryBlock, VerifyState, type DocState } from "@/components/verify";
import { getBook, user } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/borrow/$id")({
  loader: ({ params }) => { const book = getBook(params.id); if (!book) throw notFound(); return { book }; },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Borrow request: ${loaderData.book.titleEn} — Noholi Library` : "Borrow request — Noholi Library" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Review your borrowing request for a book from Noholi Library." },
      { property: "og:title", content: loaderData ? `Borrow request: ${loaderData.book.titleEn} — Noholi Library` : "Borrow request — Noholi Library" },
      { property: "og:description", content: "Review your borrowing request for a book from Noholi Library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Borrow,
});

const steps = ["Book & copy", "Your details", "Guarantor", "Borrow details", "Review"];
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

function Field({ id, label, children, err }: { id: string; label: string; children: ReactNode; err?: string }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{err && <p className="text-xs text-destructive">{err}</p>}</div>;
}

function Fee() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-y border-foreground py-4">
      <div><div className="font-medium">Borrowing fee</div><div className="text-sm text-muted-foreground">Late returns may result in a fine according to library policy.</div></div>
      <div className="font-display text-3xl tabular-nums">৳0</div>
    </div>
  );
}

function Borrow() {
  const { book } = Route.useLoaderData();
  const { addBorrowRequest, lang } = useApp();
  const [step, setStep] = useState(0);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const copies = Array.from({ length: book.totalCopies }, (_, i) => ({ label: `Copy ${i + 1} of ${book.totalCopies}`, free: i < book.availableCopies }));
  const [copy, setCopy] = useState(copies.find((c) => c.free)?.label ?? "");
  const [nid, setNid] = useState(user.nid);
  const [nidDoc, setNidDoc] = useState<DocState>(null);
  const [g, setG] = useState({ name: "", relation: "", phone: "", email: "", nid: "", present: "", permanent: "", same: true, agree: false });
  const [gPhoto, setGPhoto] = useState<DocState>(null);
  const [gNid, setGNid] = useState<DocState>(null);
  const [due, setDue] = useState(addDays(21));
  const [notes, setNotes] = useState("");
  const name = lang === "bn" ? user.nameBn : user.name;

  const errors: Partial<Record<"copy" | "nid" | "nidDoc" | "gPhoto" | "name" | "relation" | "phone" | "gnid" | "gNid" | "present" | "permanent" | "agree" | "due", string>> = {};
  if (step === 0 && !copy) errors.copy = "Choose an available copy.";
  if (step === 1) { if (nid.replace(/\s/g, "").length < 10) errors.nid = "Enter your 10, 13 or 17 digit NID number."; if (!nidDoc) errors.nidDoc = "Add a photo of your NID card."; }
  if (step === 2) {
    if (!gPhoto) errors.gPhoto = "Required";
    if (!g.name.trim()) errors.name = "Enter the guarantor's full name.";
    if (!g.relation.trim()) errors.relation = "How do you know them?";
    if (g.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a valid phone number.";
    if (g.nid.replace(/\s/g, "").length < 10) errors.gnid = "Enter their NID number.";
    if (!gNid) errors.gNid = "Required";
    if (!g.present.trim()) errors.present = "Enter their address.";
    if (!g.same && !g.permanent.trim()) errors.permanent = "Enter their permanent address.";
    if (!g.agree) errors.agree = "The guarantor must accept responsibility.";
  }
  if (step === 3 && !due) errors.due = "Pick a return date.";
  const e = tried ? errors : {};
  const next = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    setTried(false);
    if (step === 4) { setDoneId(addBorrowRequest({ bookId: book.id, copy, due, notes, guarantor: { name: g.name, relation: g.relation, phone: g.phone } })); window.scrollTo(0, 0); return; }
    setStep(step + 1); window.scrollTo(0, 0);
  };
  const back = () => { setTried(false); setStep(Math.max(0, step - 1)); };

  if (book.availableCopies === 0 && !doneId) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-4xl">Currently unavailable</h1>
        <p className="mt-3 text-muted-foreground">All copies of <em>{book.titleEn}</em> are on loan. Save it to your wishlist and check back soon.</p>
        <Button className="mt-8" variant="outline" asChild><Link to="/book/$id" params={{ id: book.id }}>Back to the book</Link></Button>
      </div>
    );
  }

  if (doneId) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-success text-background"><Check className="h-6 w-6" /></div>
        <h1 className="mt-8 text-5xl leading-tight">Borrow request submitted.</h1>
        <p className="mt-3 text-muted-foreground">The librarian will check your details and your guarantor's. You'll get an SMS when the book is ready to collect.</p>
        <dl className="mt-10 divide-y divide-border border-y border-border text-sm">
          {[["Request ID", <span className="font-mono">{doneId}</span>], ["Status", <StatusBadge status="Pending Review" />], ["Book", `${book.titleEn} · ${copy}`], ["Return by", fmtDate(due)], ["Borrowing fee", "৳0"],
            ["Next step", "Review usually takes 1–2 working days. Once approved, collect the book from the front desk with your NID."]].map(([k, v]) => (
            <div key={k as string} className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link to="/account/requests">View my borrow requests</Link></Button><Button variant="outline" asChild><Link to="/library/books">Keep browsing</Link></Button></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/book/$id" params={{ id: book.id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to book</Link>
      <div className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div><div className="eyebrow mb-2">Borrow request · Step {step + 1} of 5</div><h1 className="text-4xl md:text-5xl">{["Confirm the book", "Your details", "Guarantor", "Borrow details", "Review & submit"][step]}</h1></div>
        <div className="text-sm text-muted-foreground">Borrowing is free</div>
      </div>
      <Stepper steps={steps} current={step} className="mt-8" />

      <div className="mt-10 min-h-[320px]">
        {step === 0 && (
          <div className="grid gap-8 sm:grid-cols-[160px_minmax(0,1fr)]">
            <BookCover book={book} className="w-32 sm:w-full" />
            <div>
              <h2 className="font-display text-3xl">{book.language === "Bangla" ? <span className="font-bangla">{book.titleBn}</span> : book.titleEn}</h2>
              <div className="mt-1 text-muted-foreground">{book.authorEn}</div>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                {[["Genre", book.genre], ["Language", book.language], ["Publication", `${book.publisher}, ${book.year}`]].map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <div className="mt-6"><Availability book={book} className="text-sm" /></div>
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium">Choose a copy</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {copies.map((c) => (
                    <button key={c.label} type="button" disabled={!c.free} onClick={() => setCopy(c.label)} aria-pressed={copy === c.label}
                      className={cn("flex items-center justify-between border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50", copy === c.label ? "border-foreground bg-muted" : "border-border hover:border-foreground/40")}>
                      <span>{c.label}<span className="block text-xs text-muted-foreground">{c.free ? `${book.condition} condition · on shelf` : "Currently borrowed"}</span></span>
                      {copy === c.label && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
                {e.copy && <p className="mt-2 text-xs text-destructive">{e.copy}</p>}
              </fieldset>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-5 border-b border-border pb-6">
                <MemberAvatar className="h-20 w-20" textClass="text-3xl" />
                <div><div className="font-display text-2xl">{name}</div><div className="text-sm text-muted-foreground">{user.memberId}</div><div className="mt-1"><VerifyState state="verified" /></div></div>
              </div>
              <dl className="divide-y divide-border text-sm">
                {[["Email", user.email], ["Phone", user.phone], ["Address", user.address]].map(([k, v]) => <div key={k} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 py-3"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">From your member profile. To change these, update <Link to="/account/settings" className="underline underline-offset-2">account settings</Link>.</p>
            </div>
            <div className="space-y-6">
              <Field id="nid" label="NID number" err={e.nid}><Input id="nid" inputMode="numeric" value={nid} onChange={(x) => setNid(x.target.value)} className="h-11 font-mono" /></Field>
              <div><IdentityUpload kind="nid" label="NID card photo" hint="Front side, all four corners visible. Checked by the librarian at pickup." value={nidDoc} onChange={setNidDoc} error={!!e.nidDoc} />{e.nidDoc && <p className="mt-1 text-xs text-destructive">{e.nidDoc}</p>}</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <p className="max-w-2xl text-sm text-muted-foreground">A guarantor is someone other than you who agrees to be responsible if the book isn't returned. Please enter their details as they appear on their NID.</p>
            <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)]">
              <IdentityUpload kind="photo" label="Guarantor photo" value={gPhoto} onChange={setGPhoto} error={!!e.gPhoto} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="gn" label="Full name" err={e.name}><Input id="gn" value={g.name} onChange={(x) => setG({ ...g, name: x.target.value })} className="h-11" /></Field>
                <Field id="gr" label="Relationship to you" err={e.relation}><Input id="gr" value={g.relation} onChange={(x) => setG({ ...g, relation: x.target.value })} placeholder="Parent, sibling, teacher…" className="h-11" /></Field>
                <Field id="gp" label="Phone" err={e.phone}><Input id="gp" type="tel" value={g.phone} onChange={(x) => setG({ ...g, phone: x.target.value })} placeholder="+880 1…" className="h-11" /></Field>
                <Field id="ge" label="Email (optional)"><Input id="ge" type="email" value={g.email} onChange={(x) => setG({ ...g, email: x.target.value })} className="h-11" /></Field>
                <Field id="gnid" label="NID number" err={e.gnid}><Input id="gnid" inputMode="numeric" value={g.nid} onChange={(x) => setG({ ...g, nid: x.target.value })} className="h-11 font-mono" /></Field>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <IdentityUpload kind="nid" label="Guarantor's NID card" value={gNid} onChange={setGNid} error={!!e.gNid} />
              <div className="space-y-5">
                <Field id="gpa" label="Present address" err={e.present}><Textarea id="gpa" rows={3} value={g.present} onChange={(x) => setG({ ...g, present: x.target.value })} /></Field>
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={g.same} onCheckedChange={(c) => setG({ ...g, same: !!c })} /> Permanent address is the same</label>
                {!g.same && <Field id="gpm" label="Permanent address" err={e.permanent}><Textarea id="gpm" rows={3} value={g.permanent} onChange={(x) => setG({ ...g, permanent: x.target.value })} /></Field>}
              </div>
            </div>
            <label className={cn("flex items-start gap-3 border p-4 text-sm", e.agree ? "border-destructive" : "border-border")}>
              <Checkbox checked={g.agree} onCheckedChange={(c) => setG({ ...g, agree: !!c })} className="mt-0.5" />
              <span>The guarantor has agreed to take responsibility for this book, including any fine for late return, damage or loss, according to Noholi library policy.</span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <Field id="due" label="Return by" err={e.due}><Input id="due" type="date" value={due} min={addDays(7)} max={addDays(28)} onChange={(x) => setDue(x.target.value)} className="h-11" /></Field>
              <p className="-mt-3 text-xs text-muted-foreground">Loans run 7 to 28 days. Default is 21 days.</p>
              <Field id="notes" label="Notes for the librarian (optional)"><Textarea id="notes" rows={4} value={notes} onChange={(x) => setNotes(x.target.value)} placeholder="e.g. I'll collect on Saturday afternoon." /></Field>
            </div>
            <div><Fee /></div>
          </div>
        )}

        {step === 4 && (
          <div>
            <SummaryBlock title="Book" onEdit={() => setStep(0)}>
              <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-4"><BookCover book={book} size="sm" /><div><div className="font-display text-xl">{book.titleEn}</div><div className="text-sm text-muted-foreground">{book.authorEn}</div><div className="mt-1 text-sm">{copy}</div></div></div>
            </SummaryBlock>
            <SummaryBlock title="Member" onEdit={() => setStep(1)}>
              <div className="flex items-center gap-4"><MemberAvatar className="h-12 w-12" textClass="text-xl" /><div className="text-sm"><div className="font-display text-xl">{name}</div><div className="text-muted-foreground">{user.memberId} · NID {nid}</div><VerifyState state={nidDoc ? "uploaded" : "missing"} /></div></div>
            </SummaryBlock>
            <SummaryBlock title="Guarantor" onEdit={() => setStep(2)}>
              <div className="flex items-center gap-4">
                {gPhoto ? <img src={gPhoto.url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <Initials name={g.name} className="h-12 w-12 text-xl" />}
                <div className="text-sm"><div className="font-display text-xl">{g.name}</div><div className="text-muted-foreground">{g.relation} · {g.phone}{g.email && ` · ${g.email}`}</div><VerifyState state={gNid ? "uploaded" : "missing"} /></div>
              </div>
            </SummaryBlock>
            <SummaryBlock title="Borrow details" onEdit={() => setStep(3)}>
              <dl className="mb-6 space-y-2 text-sm"><div className="flex gap-3"><dt className="w-24 text-muted-foreground">Return by</dt><dd>{fmtDate(due)}</dd></div><div className="flex gap-3"><dt className="w-24 text-muted-foreground">Notes</dt><dd>{notes || "—"}</dd></div></dl>
              <Fee />
            </SummaryBlock>
          </div>
        )}
      </div>

      {tried && Object.keys(errors).length > 0 && <p className="mt-6 text-sm text-destructive" role="alert">Please complete the highlighted details to continue.</p>}
      <div className="sticky bottom-0 mt-10 flex justify-between gap-3 border-t border-border bg-background py-4">
        <Button variant="ghost" onClick={back} disabled={step === 0}>Back</Button>
        <Button size="lg" variant={step === 4 ? "accent" : "default"} onClick={next}>{step === 4 ? "Submit Borrow Request" : "Continue"}</Button>
      </div>
    </div>
  );
}

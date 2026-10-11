import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Check, Headphones, Library } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { Chips, More, Opt, Req } from "@/components/form-bits";
import { SearchBox } from "@/components/search-box";
import { IdentityUpload, Stepper, SummaryBlock, type DocState } from "@/components/verify";
import type { Recommendation } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/recommend")({
  head: () => ({ meta: [{ title: "Recommend a Book — My Noholi" }, { name: "description", content: "Suggest a book, e-book or audio book for Noholi Library to acquire." },
      { property: "og:title", content: "Recommend a Book — My Noholi" },
      { property: "og:description", content: "Suggest a book, e-book or audio book for Noholi Library to acquire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] }),
  component: Recommend,
});

type Format = NonNullable<Recommendation["format"]>;
const empty = { title: "", author: "", language: "", reason: "", publisher: "", isbn: "", year: "", edition: "", genre: "", category: "", narrator: "", discovered: "", source: "", link: "" };
const steps = ["Type", "Book", "More details", "Reason", "Review"];

function Err({ m }: { m?: string | false }) { return m ? <p className="text-xs text-destructive">{m}</p> : null; }

function Recommend() {
  const { recommendations, addRecommendation } = useApp();
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState<Format | null>(null);
  const [d, setD] = useState(empty);
  const [cover, setCover] = useState<DocState>(null);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const set = (k: keyof typeof empty) => (x: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: x.target.value });

  const errs = {
    format: step === 0 && !format && "Choose what you'd like to recommend.",
    title: step === 1 && !d.title.trim() && "Enter the title.",
    author: step === 1 && !d.author.trim() && "Enter the author.",
    language: step === 1 && !d.language && "Choose a language.",
    reason: step === 3 && d.reason.trim().length < 10 && "A sentence or two helps the team decide.",
  };
  const hasErr = Object.values(errs).some(Boolean);
  const e = tried ? errs : ({} as Partial<typeof errs>);
  const next = () => { setTried(true); if (hasErr) return; setTried(false); setStep(step + 1); };
  const submit = () => {
    const id = addRecommendation({ format: format!, title: d.title, author: d.author, language: d.language === "English" ? "English" : "Bangla", reason: d.reason, ...(d.publisher ? { publisher: d.publisher } : {}), ...(d.isbn ? { isbn: d.isbn } : {}), ...(d.year ? { year: d.year } : {}), ...(d.edition ? { edition: d.edition } : {}), ...(d.genre ? { genre: d.genre } : {}), ...(d.category ? { category: d.category } : {}), ...(d.narrator ? { narrator: d.narrator } : {}), ...(d.source ? { source: d.source } : {}) });
    setSent(id); setD(empty); setCover(null); setFormat(null); setStep(0); window.scrollTo(0, 0);
  };
  const kind = format === "E-Book" ? "e-book" : format === "Audio Book" ? "audio book" : "book";

  return (
    <div className="grid gap-16 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="eyebrow mb-3">Suggestion desk</div>
        <h1 className="text-4xl md:text-5xl">Recommend something for the library.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Help us build a better library. This isn't your wishlist — it's a suggestion for everyone who uses Noholi.</p>

        {sent && (
          <div className="mt-8 grid grid-cols-[32px_minmax(0,1fr)] gap-3 border border-foreground p-5" role="status">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"><Check className="h-4 w-4" /></span>
            <div><div className="font-medium">Thank you — recommendation received.</div><div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm"><span className="font-mono text-muted-foreground">{sent}</span><StatusBadge status="Submitted" /></div><div className="mt-1 text-sm text-muted-foreground">The acquisitions team reviews suggestions every month. You'll see updates in the list here.</div></div>
          </div>
        )}

        <Stepper steps={steps} current={step} className="mt-10" />
        <div className="mt-10 min-h-[280px] space-y-6">
          {step === 0 && (
            <fieldset>
              <legend className="mb-5 font-display text-2xl">What would you like to recommend to Noholi?</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {([["Physical Book", Library, "For the shelves"], ["E-Book", BookOpen, "To read online"], ["Audio Book", Headphones, "To listen to"]] as const).map(([f, Icon, sub]) => (
                  <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className={cn("border p-5 text-left transition-colors", format === f ? "border-foreground bg-muted" : "border-border hover:border-foreground/40")}>
                    <Icon className="h-5 w-5" /><div className="mt-3 font-display text-xl">{f}</div><div className="text-sm text-muted-foreground">{sub}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3"><Err m={e.format} /></div>
            </fieldset>
          )}

          {step === 1 && (
            <>
              <div className="eyebrow">{format} recommendation</div>
              <div className="space-y-2">
                <Label>Check the catalog first<Opt /></Label>
                <SearchBox groups={["Books", "Noholi Books", "E-Books", "Audio Books"]} placeholder="Is it already in Noholi? Search…" onPick={(it) => setHeld(it.title)} />
                {held && <p className="text-sm">Good news — <em>{held}</em> is already in the library. <button className="underline underline-offset-2" onClick={() => setHeld(null)}>Dismiss</button></p>}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="rt">Title<Req /></Label><Input id="rt" value={d.title} onChange={set("title")} className="h-11" /><Err m={e.title} /></div>
                <div className="space-y-2"><Label htmlFor="ra">Author<Req /></Label><Input id="ra" value={d.author} onChange={set("author")} className="h-11" /><Err m={e.author} /></div>
                <fieldset className="space-y-2"><legend className="text-sm font-medium">Language<Req /></legend><Chips options={["Bangla", "English", "Other"]} value={[d.language]} onChange={(v) => setD({ ...d, language: v[0]! })} /><Err m={e.language} /></fieldset>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">All optional — anything here helps the team find the right {kind}. Skip ahead if you're not sure.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                {format === "Audio Book" && <div className="space-y-2"><Label htmlFor="rn">Narrator<Opt /></Label><Input id="rn" value={d.narrator} onChange={set("narrator")} className="h-11" /></div>}
                <div className="space-y-2"><Label htmlFor="rp">Publisher<Opt /></Label><Input id="rp" value={d.publisher} onChange={set("publisher")} className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="ry">Publication year<Opt /></Label><Input id="ry" inputMode="numeric" value={d.year} onChange={set("year")} className="h-11" /></div>
                <fieldset className="space-y-2"><legend className="text-sm font-medium">Genre<Opt /></legend><Chips options={["Fiction", "Non-fiction"]} value={[d.genre]} onChange={(v) => setD({ ...d, genre: v[0]! })} /></fieldset>
                <fieldset className="space-y-2"><legend className="text-sm font-medium">Category<Opt /></legend><Chips options={["Adults", "Children", "General"]} value={[d.category]} onChange={(v) => setD({ ...d, category: v[0]! })} /></fieldset>
              </div>
              <More label="Add ISBN, cover and where to find it">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="ri">ISBN<Opt /></Label><Input id="ri" value={d.isbn} onChange={set("isbn")} className="h-11 font-mono" /></div>
                  {format === "Physical Book" && <div className="space-y-2"><Label htmlFor="re">Edition<Opt /></Label><Input id="re" value={d.edition} onChange={set("edition")} className="h-11" /></div>}
                  {format === "Physical Book" && <div className="space-y-2 sm:col-span-2"><Label htmlFor="rdc">Where did you discover it?<Opt /></Label><Input id="rdc" value={d.discovered} onChange={set("discovered")} placeholder="e.g. Ekushey Boi Mela, a friend's shelf" className="h-11" /></div>}
                  {format !== "Physical Book" && <div className="space-y-2"><Label htmlFor="rs">{format === "Audio Book" ? "Platform / source" : "Source / publisher"}<Opt /></Label><Input id="rs" value={d.source} onChange={set("source")} className="h-11" /></div>}
                  {format !== "Physical Book" && <div className="space-y-2"><Label htmlFor="rl">Link<Opt /></Label><Input id="rl" type="url" value={d.link} onChange={set("link")} placeholder="https://" className="h-11" /></div>}
                  <div className="max-w-[200px]"><IdentityUpload kind="photo" label="Cover" value={cover} onChange={setCover} /></div>
                </div>
              </More>
            </>
          )}

          {step === 3 && (
            <div className="space-y-2"><Label htmlFor="rr">Why should Noholi add this {kind}?<Req /></Label><Textarea id="rr" rows={6} value={d.reason} onChange={set("reason")} placeholder="Who would read or listen to it, and why it matters…" className="font-display text-lg leading-relaxed" /><Err m={e.reason} /></div>
          )}

          {step === 4 && (
            <>
              <SummaryBlock title={`${format} recommendation`} onEdit={() => setStep(1)}>
                <div className="font-display text-2xl">{d.title}</div>
                <div className="text-sm text-muted-foreground">{d.author} · {d.language}{d.narrator && ` · read by ${d.narrator}`}{d.publisher && ` · ${d.publisher}`}{d.year && `, ${d.year}`}</div>
              </SummaryBlock>
              <SummaryBlock title="Reason" onEdit={() => setStep(3)}><p className="whitespace-pre-line">{d.reason}</p></SummaryBlock>
              <p className="border-t border-border pt-5 text-sm text-muted-foreground">You'll get a recommendation ID with the status <strong className="text-foreground">Submitted</strong>.</p>
            </>
          )}
        </div>
        {tried && hasErr && <p className="mt-6 text-sm text-destructive" role="alert">Please complete the highlighted fields.</p>}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button variant="ghost" onClick={() => { setTried(false); setStep(Math.max(0, step - 1)); }} disabled={step === 0}>Back</Button>
          <div className="ml-auto flex gap-3">
            {step >= 1 && <Button variant="outline" onClick={() => toast("Draft saved", { description: "Your recommendation is kept for this session." })}>Save draft</Button>}
            {step < 4 ? <Button size="lg" onClick={next}>{step === 2 ? "Continue" : "Continue"}</Button> : <Button size="lg" variant="accent" onClick={submit}>Submit Recommendation</Button>}
          </div>
        </div>
      </div>
      <aside className="lg:col-span-5">
        <h2 className="rule-top pt-5 text-2xl">Your recommendations</h2>
        {recommendations.length === 0 ? <div className="mt-6"><Empty title="You haven't recommended a book yet." body="Your suggestions will appear here with their status." /></div> : (
          <ul className="mt-2 divide-y divide-border">
            {recommendations.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="eyebrow">{r.format ?? "Physical Book"}</div><div className="mt-1 font-display text-lg leading-tight">{r.title}</div><div className="text-sm text-muted-foreground">{r.author} · {r.language}</div></div><StatusBadge status={r.status} /></div>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span className="font-mono">{r.id} · {fmtDate(r.date)}</span><Link to="/account/recommendations/$id" params={{ id: r.id }} className="underline underline-offset-4 hover:text-accent">View details</Link></div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-xs text-muted-foreground">Statuses: Submitted → Under Review → Considering → Acquired or Not Planned.</p>
      </aside>
    </div>
  );
}

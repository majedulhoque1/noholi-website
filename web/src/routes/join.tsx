import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/noholi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Become a Member — Noholi Library" },
      { name: "description", content: "Join Noholi Library: borrow books, read e-books and listen to audio books." },
      { property: "og:title", content: "Become a Noholi member" },
      { property: "og:description", content: "One card for every shelf, recording and reading evening." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Join,
});

const steps = ["Personal", "Contact", "Account", "Review"];

function Join() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [d, setD] = useState({ name: "", dob: "", gender: "", email: "", phone: "", address: "", pw: "", pw2: "", terms: false });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });

  const validate = () => {
    if (step === 0 && !d.name) return "Please enter your full name.";
    if (step === 1 && (!d.email.includes("@") || d.phone.length < 8)) return "Please enter a valid email and phone number.";
    if (step === 2 && (d.pw.length < 6 || d.pw !== d.pw2)) return "Passwords must match and be at least 6 characters.";
    if (step === 3 && !d.terms) return "Please agree to the membership terms.";
    return "";
  };
  const nextStep = () => { const e = validate(); setErr(e); if (e) return; if (step === 3) setDone(true); else setStep(step + 1); };

  return (
    <div className="min-h-screen">
      <header className="container-page flex h-20 items-center justify-between border-b border-border">
        <Link to="/"><Logo /></Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to website</Link>
      </header>

      {done ? (
        <div className="container-page max-w-2xl py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-background"><Check className="h-7 w-7" /></div>
          <h1 className="mt-8 text-5xl md:text-6xl">Welcome to Noholi, {d.name.split(" ")[0]}.</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">Your application is received. Bring a photo ID to the front desk within 14 days to collect your card.</p>
          <div className="mx-auto mt-10 max-w-sm border border-foreground p-6 text-left">
            <div className="flex items-start justify-between"><Logo className="h-7" /><span className="eyebrow">Patron card</span></div>
            <div className="mt-8 font-display text-2xl">{d.name}</div>
            <div className="mt-1 flex justify-between text-sm text-muted-foreground"><span>NH-00{Math.floor(200 + Math.random() * 700)}</span><span>Free membership</span></div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-warning"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Pending verification</div>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => nav({ to: "/login" })}>Log in</Button>
            <Button size="lg" variant="outline" asChild><Link to="/library/books">Browse the library</Link></Button>
          </div>
        </div>
      ) : (
        <div className="container-page grid gap-16 py-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="eyebrow mb-4">Membership</div>
            <h1 className="text-5xl leading-[1]">Become part of Noholi.</h1>
            <p className="mt-4 text-muted-foreground">Membership is free. Four short steps — about three minutes, no payment.</p>
            <ol className="mt-10 space-y-1" aria-label="Progress">
              {steps.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-4 py-2", i > step && "text-muted-foreground")}>
                  <span className={cn("grid h-8 w-8 place-items-center rounded-full border text-xs", i < step ? "border-foreground bg-foreground text-background" : i === step ? "border-accent text-accent" : "border-border")}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
                  <span className={cn(i === step && "font-medium")}>{s}</span>
                </li>
              ))}
            </ol>
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="mb-8 h-1 bg-muted"><div className="h-full bg-accent transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
            <h2 className="mb-8 text-3xl">Step {step + 1} — {["Personal information", "Contact information", "Account setup", "Review & confirm"][step]}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {step === 0 && <>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="name">Full name</Label><Input id="name" value={d.name} onChange={set("name")} placeholder="e.g. Nusrat Jahan" className="h-12" /></div>
                <div className="space-y-2"><Label htmlFor="dob">Date of birth</Label><Input id="dob" type="date" value={d.dob} onChange={set("dob")} className="h-12" /></div>
                <div className="space-y-2"><Label htmlFor="g">Occupation <span className="text-muted-foreground">(optional)</span></Label><Input id="g" value={d.gender} onChange={set("gender")} placeholder="Student, teacher…" className="h-12" /></div>
              </>}
              {step === 1 && <>
                <div className="space-y-2"><Label htmlFor="em">Email</Label><Input id="em" type="email" value={d.email} onChange={set("email")} placeholder="you@example.com" className="h-12" /></div>
                <div className="space-y-2"><Label htmlFor="ph">Phone</Label><Input id="ph" value={d.phone} onChange={set("phone")} placeholder="+880 17…" className="h-12" /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="ad">Address</Label><Textarea id="ad" value={d.address} onChange={set("address")} placeholder="House, road, area, city" rows={3} /></div>
              </>}
              {step === 2 && <>
                <div className="border-y border-foreground py-4 sm:col-span-2"><div className="font-display text-xl">Membership is free.</div><div className="mt-1 text-sm text-muted-foreground">No membership fee and no payment — now or later. Borrowing is free too.</div></div>
                <div className="space-y-2"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" value={d.pw} onChange={set("pw")} className="h-12" /></div>
                <div className="space-y-2"><Label htmlFor="pw2">Confirm password</Label><Input id="pw2" type="password" value={d.pw2} onChange={set("pw2")} className="h-12" /></div>
              </>}
              {step === 3 && <div className="sm:col-span-2">
                <dl className="divide-y divide-border border-y border-border">
                  {[["Name", d.name], ["Date of birth", d.dob || "—"], ["Email", d.email], ["Phone", d.phone], ["Address", d.address || "—"], ["Membership", "Free"]].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[140px_minmax(0,1fr)] py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
                <label className="mt-6 flex items-start gap-3 text-sm"><Checkbox checked={d.terms} onCheckedChange={(c) => setD({ ...d, terms: !!c })} className="mt-0.5" /> I agree to the Noholi membership terms and borrowing rules, including fines for late returns according to library policy.</label>
              </div>}
            </div>
            {err && <p className="mt-5 text-sm text-destructive" role="alert">{err}</p>}
            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={() => { setErr(""); setStep(Math.max(0, step - 1)); }} disabled={step === 0}>Back</Button>
              <Button size="lg" variant={step === 3 ? "accent" : "default"} onClick={nextStep}>{step === 3 ? "Submit application" : "Continue"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

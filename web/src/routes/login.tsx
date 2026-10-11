import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/noholi";
import { images } from "@/lib/data";
import { useApp } from "@/lib/store";
import { describeError } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Noholi Library" },
      { name: "description", content: "Log in to your Noholi patron account." },
      { property: "og:title", content: "Log in to Noholi" },
      { property: "og:description", content: "Access your wishlist, loans and digital library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!id.trim() || !pw) { setErr("Enter your email or Member ID and password."); return; }
    setBusy(true);
    setErr("");
    try {
      await login(id, pw);
      // TODO(auth-account agent): a member with must_change_password goes to /account/password once that route exists.
      nav({ to: "/account" });
    } catch (error) {
      setErr(describeError(error));
      setBusy(false);
    }
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 md:px-16">
        <div className="flex items-center justify-between"><Link to="/"><Logo /></Link><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to website</Link></div>
        <div className="mx-auto my-auto w-full max-w-sm py-16">
          <div className="eyebrow mb-4">Patron login</div>
          <h1 className="text-5xl">Welcome back.</h1>
          <p className="mt-3 text-muted-foreground">Your shelf, your loans, your place in every book.</p>
          <form onSubmit={submit} className="mt-10 space-y-5">
            <div className="space-y-2"><Label htmlFor="id">Email or Member ID</Label><Input id="id" value={id} onChange={(e) => setId(e.target.value)} className="h-12" autoComplete="username" /></div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label htmlFor="pw">Password</Label><a href="#" className="text-xs underline underline-offset-4">Forgot password?</a></div>
              <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="h-12" autoComplete="current-password" />
            </div>
            {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Remember me</label>
            <Button type="submit" size="lg" className="w-full" disabled={busy} aria-busy={busy}>{busy ? "Logging in…" : "Log in"}</Button>
          </form>
          <p className="mt-8 text-sm">New to Noholi? <Link to="/join" className="underline underline-offset-4 hover:text-accent">Become a member</Link></p>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img src={images.gReader} alt="" className="photo absolute inset-0 h-full w-full object-cover" />
        <blockquote className="absolute bottom-10 left-10 right-10 bg-background p-8 font-display text-2xl italic leading-snug">"It's better the second time. It's best the fortieth."<div className="mt-3 font-sans text-xs not-italic text-muted-foreground">— from The Last Borrower, Noholi Write Ups</div></blockquote>
      </div>
    </div>
  );
}

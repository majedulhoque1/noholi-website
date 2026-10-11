import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/noholi";
import { images } from "@/lib/data";
import { useApp } from "@/lib/store";
import { describeError } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in — Noholi Library" },
      { name: "description", content: "Log in to your Noholi patron account." },
      { property: "og:title", content: "Log in to Noholi" },
      { property: "og:description", content: "Access your loans, requests and account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

/** Only same-site paths are allowed as a post-login destination (no open redirects). */
function safeRedirect(target: string | undefined): string | null {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\"))
    return null;
  if (target === "/login" || target.startsWith("/login?")) return null;
  return target;
}

function Login() {
  const { login, t } = useApp();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!id.trim() || !pw) {
      setErr(t("auth.enterCredentials"));
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const member = await login(id, pw);
      // A temporary password (set by the desk) must be replaced before anything else.
      const dest = member.must_change_password
        ? "/account/password"
        : (safeRedirect(redirect) ?? "/account");
      router.history.push(dest);
    } catch (error) {
      // Keep what the reader typed; only report the problem.
      setErr(describeError(error));
      setBusy(false);
    }
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 md:px-16">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("auth.login.back")}
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-sm py-16">
          <div className="eyebrow mb-4">{t("auth.login.eyebrow")}</div>
          <h1 className="text-5xl">{t("auth.login.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("auth.login.subtitle")}</p>
          <form onSubmit={submit} className="mt-10 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="id">{t("auth.login.idLabel")}</Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-12"
                autoComplete="username"
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">{t("auth.login.passwordLabel")}</Label>
              <Input
                id="pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="h-12"
                autoComplete="current-password"
                disabled={busy}
              />
            </div>
            {err && (
              <p className="text-sm text-destructive" role="alert">
                {err}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy} aria-busy={busy}>
              {busy ? t("auth.login.loggingIn") : t("auth.login.submit")}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("auth.login.forgot")}{" "}
            <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">
              {t("auth.login.contactLibrary")}
            </Link>
          </p>
          <p className="mt-8 text-sm">
            {t("auth.login.newHere")}{" "}
            <Link to="/join" className="underline underline-offset-4 hover:text-accent">
              {t("auth.login.becomeMember")}
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img
          src={images.gReader}
          alt=""
          className="photo absolute inset-0 h-full w-full object-cover"
        />
        <blockquote className="absolute bottom-10 left-10 right-10 bg-background p-8 font-display text-2xl italic leading-snug">
          "It's better the second time. It's best the fortieth."
          <div className="mt-3 font-sans text-xs not-italic text-muted-foreground">
            — from The Last Borrower, Noholi Write Ups
          </div>
        </blockquote>
      </div>
    </div>
  );
}

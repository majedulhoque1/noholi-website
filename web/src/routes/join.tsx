import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/noholi";
import { buildSections, useRuleSettings } from "@/components/library-rules";
import { compressPhoto, EMAIL_RE, isAllowedPhoto, submitIntake } from "@/lib/intake";
import { describeError, supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Become a Member — Noholi Library" },
      {
        name: "description",
        content: "Join Noholi Library: borrow books, read e-books and listen to audio books.",
      },
      { property: "og:title", content: "Become a Noholi member" },
      {
        property: "og:description",
        content: "One card for every shelf, recording and reading evening.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Join,
});

const stepKeys = [
  "forms.join.step1",
  "forms.join.step2",
  "forms.join.step3",
  "forms.join.step4",
] as const;

const empty = {
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  district: "",
  postal: "",
  website: "", // honeypot: people never see or fill it; bots do (CONTRACT.md §5)
};

type Done = { name: string; phone: string; ref: string | null; photoFailed: boolean };

function Join() {
  const { t, lang } = useApp();
  const rules = useRuleSettings();
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [d, setD] = useState(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set =
    (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setD({ ...d, [k]: e.target.value });

  const validate = () => {
    if (step === 0) {
      if (!d.name.trim()) return t("forms.join.errName");
      if (!EMAIL_RE.test(d.email.trim())) return t("forms.join.errEmail");
      if (d.phone.replace(/\D/g, "").length < 7) return t("forms.join.errPhone");
    }
    if (step === 1 && !d.street.trim()) return t("forms.join.errStreet");
    if (step === 3 && !agreed) return t("forms.join.errRules");
    return "";
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (!isAllowedPhoto(file)) {
      setPhoto(null);
      setErr(t("forms.join.errPhoto"));
      return;
    }
    setErr("");
    setPhoto(file);
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const compressed = photo ? await compressPhoto(photo) : null;
      const reply = await submitIntake(
        {
          type: "application",
          name: d.name.trim(),
          phone: d.phone.trim(),
          email: d.email.trim(),
          street: d.street.trim(),
          city: d.city.trim(),
          district: d.district.trim(),
          postal_code: d.postal.trim(),
          has_photo: !!compressed,
          website: d.website, // honeypot
        },
        t("forms.join.sendFailed"),
      );
      let photoFailed = false;
      if (compressed && reply.photo_upload) {
        const { path, token } = reply.photo_upload;
        const { error: upErr } = await supabase.storage
          .from("member-photos")
          .uploadToSignedUrl(path, token, compressed, {
            contentType: compressed.type,
            upsert: true,
          });
        photoFailed = !!upErr;
      }
      setDone({ name: d.name.trim(), phone: d.phone.trim(), ref: reply.id ?? null, photoFailed });
      setD(empty);
      setPhoto(null);
      window.scrollTo(0, 0);
    } catch (e) {
      // Keep everything the visitor typed; just say what went wrong.
      setErr(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const nextStep = () => {
    const e = validate();
    setErr(e);
    if (e) return;
    if (step === 3) void submit();
    else setStep(step + 1);
  };

  const reviewRows: [string, string][] = [
    [t("forms.join.name"), d.name],
    [t("forms.join.email"), d.email],
    [t("forms.join.phone"), d.phone],
    [t("forms.join.street"), d.street],
    [t("forms.join.city"), d.city || "—"],
    [t("forms.join.district"), d.district || "—"],
    [t("forms.join.postal"), d.postal || "—"],
    [t("forms.join.reviewPhoto"), photo ? photo.name : t("forms.join.photoNone")],
    [t("forms.join.reviewMembership"), t("forms.join.reviewFree")],
  ];

  return (
    <div className="min-h-screen">
      <header className="container-page flex h-20 items-center justify-between border-b border-border">
        <Link to="/">
          <Logo />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t("forms.join.backToSite")}
        </Link>
      </header>

      {done ? (
        <div className="container-page max-w-2xl py-20 text-center" role="status">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-background">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-5xl md:text-6xl">{t("forms.join.doneTitle")}</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            {t("forms.join.doneThanks", { name: done.name })}
            {done.ref ? ` ${t("forms.join.doneRef", { ref: done.ref })}` : ""}{" "}
            {t("forms.join.donePhone", { phone: done.phone })}
          </p>
          {done.photoFailed && (
            <p className="mx-auto mt-3 max-w-md text-sm text-warning" role="alert">
              {t("forms.join.donePhotoFailed")}
            </p>
          )}
          {done.ref && (
            <div className="mx-auto mt-8 max-w-xs border border-foreground p-5 text-left">
              <div className="eyebrow">{t("forms.join.refLabel")}</div>
              <div className="mt-2 font-mono text-2xl">{done.ref}</div>
            </div>
          )}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/library/books">{t("forms.join.browse")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">{t("forms.join.backToSite")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="container-page grid gap-16 py-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="eyebrow mb-4">{t("forms.join.eyebrow")}</div>
            <h1 className="text-5xl leading-[1]">{t("forms.join.title")}</h1>
            <p className="mt-4 text-muted-foreground">{t("forms.join.intro")}</p>
            <ol className="mt-10 space-y-1" aria-label="Progress">
              {stepKeys.map((k, i) => (
                <li
                  key={k}
                  className={cn(
                    "flex items-center gap-4 py-2",
                    i > step && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full border text-xs",
                      i < step
                        ? "border-foreground bg-foreground text-background"
                        : i === step
                          ? "border-accent text-accent"
                          : "border-border",
                    )}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={cn(i === step && "font-medium")}>{t(k)}</span>
                </li>
              ))}
            </ol>
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="mb-8 h-1 bg-muted">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>
            {step === 0 && (
              <section
                aria-labelledby="join-rules-h"
                className="mb-10 border border-foreground bg-muted/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground px-5 py-3">
                  <h2 id="join-rules-h" className="text-2xl">
                    {t("forms.join.rulesTitle")}
                  </h2>
                  <Link
                    to="/library/rules"
                    target="_blank"
                    className="text-sm underline underline-offset-4 hover:text-accent"
                  >
                    {t("forms.join.rulesOpen")}
                  </Link>
                </div>
                <p className="px-5 pt-3 text-sm text-muted-foreground">
                  {t("forms.join.rulesIntro")}
                </p>
                <div
                  tabIndex={0}
                  role="region"
                  aria-label={t("forms.join.rulesTitle")}
                  className="max-h-72 overflow-y-auto px-5 py-4"
                >
                  {rules.error && (
                    <p role="alert" className="mb-3 text-sm text-destructive">
                      {t("catalog.rulesLoadError", { error: rules.error })}
                    </p>
                  )}
                  <ol className="space-y-5">
                    {buildSections(t, lang, rules.settings).map((s, i) => (
                      <li key={s.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
                        <span className="font-display tabular-nums text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="font-display text-lg leading-tight">{s.title}</h3>
                          {s.body.map((p) => (
                            <p
                              key={p}
                              className={cn(
                                "mt-1.5 text-sm leading-relaxed",
                                s.pending && "italic text-muted-foreground",
                              )}
                            >
                              {p}
                            </p>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            )}
            <h2 className="mb-8 text-3xl">
              {t("forms.join.stepHeading", { n: step + 1, name: t(stepKeys[step]) })}
            </h2>
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                nextStep();
              }}
              noValidate
            >
              {step === 0 && (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">{t("forms.join.name")}</Label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={d.name}
                      onChange={set("name")}
                      placeholder={t("forms.join.namePh")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="em">{t("forms.join.email")}</Label>
                    <Input
                      id="em"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={d.email}
                      onChange={set("email")}
                      placeholder={t("forms.join.emailPh")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ph">{t("forms.join.phone")}</Label>
                    <Input
                      id="ph"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={d.phone}
                      onChange={set("phone")}
                      placeholder={t("forms.join.phonePh")}
                      className="h-12"
                    />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="st">{t("forms.join.street")}</Label>
                    <Input
                      id="st"
                      name="street"
                      autoComplete="street-address"
                      value={d.street}
                      onChange={set("street")}
                      placeholder={t("forms.join.streetPh")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ci">
                      {t("forms.join.city")}{" "}
                      <span className="text-muted-foreground">{t("forms.join.optional")}</span>
                    </Label>
                    <Input
                      id="ci"
                      name="city"
                      autoComplete="address-level2"
                      value={d.city}
                      onChange={set("city")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="di">
                      {t("forms.join.district")}{" "}
                      <span className="text-muted-foreground">{t("forms.join.optional")}</span>
                    </Label>
                    <Input
                      id="di"
                      name="district"
                      autoComplete="address-level1"
                      value={d.district}
                      onChange={set("district")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="po">
                      {t("forms.join.postal")}{" "}
                      <span className="text-muted-foreground">{t("forms.join.optional")}</span>
                    </Label>
                    <Input
                      id="po"
                      name="postal_code"
                      autoComplete="postal-code"
                      value={d.postal}
                      onChange={set("postal")}
                      className="h-12"
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="border-y border-foreground py-4 sm:col-span-2">
                    <div className="font-display text-xl">{t("forms.join.freeTitle")}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("forms.join.freeBody")}
                    </div>
                  </div>
                  <div className="space-y-3 sm:col-span-2">
                    <Label htmlFor="photo">
                      {t("forms.join.photo")}{" "}
                      <span className="text-muted-foreground">{t("forms.join.optional")}</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">{t("forms.join.photoHint")}</p>
                    <input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={onPhoto}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="photo" className="cursor-pointer">
                          {photo ? t("forms.join.changePhoto") : t("forms.join.choosePhoto")}
                        </label>
                      </Button>
                      {photo && (
                        <>
                          <span className="min-w-0 truncate text-sm">
                            {t("forms.join.photoSelected", { name: photo.name })}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPhoto(null)}
                          >
                            {t("forms.join.removePhoto")}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              {step === 3 && (
                <div className="sm:col-span-2">
                  <dl className="divide-y divide-border border-y border-border">
                    {reviewRows.map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[140px_minmax(0,1fr)] py-3 text-sm">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <label className="mt-6 flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>
                      {t("forms.join.rulesAgree")}{" "}
                      <Link
                        to="/library/rules"
                        target="_blank"
                        className="underline underline-offset-2 hover:text-accent"
                      >
                        {t("forms.join.rulesTitle")}
                      </Link>
                      .
                    </span>
                  </label>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {t("forms.join.consent")}{" "}
                    <Link to="/privacy" className="underline underline-offset-2 hover:text-accent">
                      {t("forms.join.consentLink")}
                    </Link>
                    .
                  </p>
                </div>
              )}
              {/* honeypot: visually hidden and empty; bots fill it (CONTRACT.md §5) */}
              <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="join-website">Website</label>
                <input
                  id="join-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={d.website}
                  onChange={set("website")}
                />
              </div>
              {/* Enter submits the current step; the visible buttons below do the same. */}
              <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
            </form>
            {err && (
              <p className="mt-5 text-sm text-destructive" role="alert">
                {err}
              </p>
            )}
            {busy && (
              <p className="mt-5 text-sm text-muted-foreground" role="status">
                {t("forms.join.sending")}
              </p>
            )}
            <div className="mt-10 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setErr("");
                  setStep(Math.max(0, step - 1));
                }}
                disabled={step === 0 || busy}
              >
                {t("forms.join.back")}
              </Button>
              <Button
                size="lg"
                variant={step === 3 ? "accent" : "default"}
                onClick={nextStep}
                disabled={busy}
              >
                {step === 3
                  ? busy
                    ? t("forms.join.sending")
                    : t("forms.join.submit")
                  : t("forms.join.continue")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

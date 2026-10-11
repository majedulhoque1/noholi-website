import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/noholi";
import { LocationMap } from "@/components/location-map";
import { library } from "@/lib/data";
import { EMAIL_RE, submitIntake } from "@/lib/intake";
import { describeError } from "@/lib/supabase";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Noholi Library" },
      {
        name: "description",
        content: "Send a message to Noholi Library: membership, donations, events and more.",
      },
      { property: "og:title", content: "Contact Noholi Library" },
      {
        property: "og:description",
        content: "A contact form for Noholi Library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const empty = { name: "", email: "", subject: "", message: "", website: "" };

function Contact() {
  const { t } = useApp();
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  const [d, setD] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set =
    (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setD({ ...d, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const name = d.name.trim();
    const email = d.email.trim();
    const message = d.message.trim();
    if (!name || !email || !message) return setErr(t("forms.contact.errRequired"));
    if (!EMAIL_RE.test(email)) return setErr(t("forms.contact.errEmail"));
    setBusy(true);
    setErr("");
    try {
      // Lands in the library's Messages inbox in Noholi OS; staff reply by email.
      await submitIntake(
        { type: "contact", name, email, subject: d.subject.trim(), message, website: d.website },
        t("forms.contact.sendFailed"),
      );
      setSent({ name, email });
      setD(empty);
    } catch (error) {
      // The form keeps what was typed; only the error changes.
      setErr(describeError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow={t("forms.contact.eyebrow")} title={t("forms.contact.title")}>
        {t("forms.contact.intro")}
      </PageIntro>
      <section className="container-page grid gap-16 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-4">
          {library.confirmed ? (
            <>
              {[
                {
                  icon: MapPin,
                  t: "Address",
                  d: library.address.join("\n"),
                  href: library.mapsUrl,
                },
                { icon: Phone, t: "Phone", d: library.phoneDisplay, href: library.phoneHref },
                {
                  icon: Mail,
                  t: "Email",
                  d: library.email,
                  href: `mailto:${library.email}`,
                },
              ].map((x) => (
                <div key={x.t} className="grid grid-cols-[24px_minmax(0,1fr)] gap-4">
                  <x.icon className="mt-1 h-5 w-5 text-accent" />
                  <div>
                    <div className="eyebrow mb-2">{x.t}</div>
                    <a
                      href={x.href}
                      target={x.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="block whitespace-pre-line font-display text-xl leading-snug hover:text-accent"
                    >
                      {x.d}
                    </a>
                  </div>
                </div>
              ))}
              <div className="border-t border-border pt-8">
                <div className="eyebrow mb-4">Opening hours</div>
                <dl className="space-y-2 text-sm">
                  {library.hours.map(([day, h]) => (
                    <div
                      key={day}
                      className="flex justify-between border-b border-dashed border-border pb-2"
                    >
                      <dt>{day}</dt>
                      <dd className="tabular-nums text-muted-foreground">{h}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          ) : (
            <div className="border-l-2 border-foreground/30 pl-5">
              <div className="eyebrow mb-2">{t("forms.soon.badge")}</div>
              <div className="font-display text-xl leading-snug">
                {t("forms.contact.detailsTitle")}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t("forms.contact.detailsSoon")}</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {sent ? (
            <div className="border border-border p-10 text-center" role="status">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success text-background">
                <Check />
              </div>
              <h2 className="mt-6 text-3xl">{t("forms.contact.sentTitle")}</h2>
              <p className="mt-2 text-muted-foreground">
                {t("forms.contact.sentBody", { name: sent.name, email: sent.email })}
              </p>
              <Button variant="outline" className="mt-8" onClick={() => setSent(null)}>
                {t("forms.contact.sendAnother")}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="n">{t("forms.contact.name")}</Label>
                <Input
                  id="n"
                  name="name"
                  autoComplete="name"
                  required
                  value={d.name}
                  onChange={set("name")}
                  placeholder={t("forms.contact.namePh")}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e">{t("forms.contact.email")}</Label>
                <Input
                  id="e"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={d.email}
                  onChange={set("email")}
                  placeholder={t("forms.contact.emailPh")}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="s">{t("forms.contact.subject")}</Label>
                <Input
                  id="s"
                  name="subject"
                  value={d.subject}
                  onChange={set("subject")}
                  placeholder={t("forms.contact.subjectPh")}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="m">{t("forms.contact.message")}</Label>
                <Textarea
                  id="m"
                  name="message"
                  required
                  rows={7}
                  value={d.message}
                  onChange={set("message")}
                  placeholder={t("forms.contact.messagePh")}
                />
              </div>
              {/* honeypot: visually hidden and empty; bots fill it (CONTRACT.md §5) */}
              <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={d.website}
                  onChange={set("website")}
                />
              </div>
              {err && (
                <p className="text-sm text-destructive sm:col-span-2" role="alert">
                  {err}
                </p>
              )}
              <div className="sm:col-span-2">
                <Button size="lg" type="submit" disabled={busy}>
                  {busy ? t("forms.contact.sending") : t("forms.contact.send")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
      {library.confirmed && (
        <section className="container-page mt-20">
          <LocationMap className="h-[26rem] w-full" card />
        </section>
      )}
    </>
  );
}

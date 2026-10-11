import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Noholi Library" },
      {
        name: "description",
        content: "What personal details Noholi Library keeps, who can see them, and for how long.",
      },
      { property: "og:title", content: "Privacy Notice — Noholi Library" },
      {
        property: "og:description",
        content: "A short, plain account of the personal details Noholi Library keeps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { t } = useApp();
  const sections: { n: string; title: string; body: ReactNode }[] = [
    {
      n: "01",
      title: t("forms.privacy.s1Title"),
      body: (
        <ul className="space-y-3">
          {(["membership", "borrow", "lending"] as const).map((k) => (
            <li key={k}>
              <strong className="font-medium text-foreground">
                {t(`forms.privacy.${k}Collect`)}
              </strong>
              {t(`forms.privacy.${k}CollectText`)}
            </li>
          ))}
        </ul>
      ),
    },
    { n: "02", title: t("forms.privacy.s2Title"), body: <p>{t("forms.privacy.s2Body")}</p> },
    { n: "03", title: t("forms.privacy.s3Title"), body: <p>{t("forms.privacy.s3Body")}</p> },
    { n: "04", title: t("forms.privacy.s4Title"), body: <p>{t("forms.privacy.s4Body")}</p> },
    {
      n: "05",
      title: t("forms.privacy.s5Title"),
      body: (
        <p>
          {t("forms.privacy.s5Body1")}
          <Link to="/contact" className="underline underline-offset-4 hover:text-accent">
            {t("forms.privacy.s5Link")}
          </Link>
          {t("forms.privacy.s5Body2")}
        </p>
      ),
    },
  ];
  return (
    <>
      <section className="container-page pb-12 pt-16 md:pt-24">
        <div className="eyebrow mb-8">{t("forms.privacy.eyebrow")}</div>
        <h1 className="max-w-4xl text-5xl leading-[1] md:text-7xl">{t("forms.privacy.title")}</h1>
        <p className="mt-6 max-w-2xl font-display text-2xl leading-relaxed text-muted-foreground">
          {t("forms.privacy.lede")}
        </p>
      </section>

      <section className="container-page pb-8">
        <div className="divide-y divide-border border-y border-border">
          {sections.map((s) => (
            <div key={s.n} className="grid gap-4 py-10 lg:grid-cols-12 lg:gap-12">
              <div className="flex items-baseline gap-4 lg:col-span-4">
                <span className="font-mono text-sm text-muted-foreground">{s.n}</span>
                <h2 className="text-3xl">{s.title}</h2>
              </div>
              <div className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:col-span-8 [&_ul]:list-disc [&_ul]:pl-5">
                {s.body}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          {t("forms.privacy.seeAlso")}
          <Link to="/library/rules" className="underline underline-offset-4 hover:text-accent">
            {t("forms.privacy.rulesLink")}
          </Link>
          .
        </p>
      </section>
    </>
  );
}

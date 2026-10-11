import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/noholi";
import { fmtNum, getPublicSettings, type BookLang, type PublicSettings } from "@/lib/books";
import type { TKey, TVars } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { describeError } from "@/lib/supabase";

export const Route = createFileRoute("/library/rules")({
  // Policy numbers come from the database (get_public_settings), never from this file. A failed
  // fetch is returned as an error string so the page can say so instead of guessing.
  loader: async () => {
    try {
      return { settings: await getPublicSettings(), error: null as string | null };
    } catch (err) {
      return { settings: null as PublicSettings | null, error: describeError(err) };
    }
  },
  head: () => ({
    meta: [
      { title: "Library Rules — Noholi Library" },
      {
        name: "description",
        content: "How membership, borrowing, returns and conduct work at Noholi Library.",
      },
      { property: "og:title", content: "Library Rules — Noholi Library" },
      {
        property: "og:description",
        content: "Our library rules help keep Noholi welcoming, accessible, and fair to everyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rules,
});

type Section = { id: string; title: string; body: string[]; pending?: boolean };

const weekdayName = (dow: number, lang: BookLang) =>
  new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 7 + dow))); // 7 Jan 2024 was a Sunday (Postgres DOW 0)

/**
 * Only what the database settings and the existing pages state as fact is written as fact;
 * everything else stays "to be confirmed". Never invent policy here.
 */
function buildSections(
  t: (k: TKey, vars?: TVars) => string,
  lang: BookLang,
  s: PublicSettings | null,
): Section[] {
  const tbc = t("catalog.rulesTbc");
  const days = (n: number) => t(n === 1 ? "catalog.nDay" : "catalog.nDays", { n: fmtNum(n, lang) });
  const tbcOnly = (id: string, title: TKey): Section => ({
    id,
    title: t(title),
    body: [tbc],
    pending: true,
  });

  const closed = (s?.closed_weekdays ?? []).map((d) => weekdayName(d, lang));
  const loan: Section = s
    ? {
        id: "loan",
        title: t("catalog.rulesLoan"),
        body: [
          t("catalog.rulesLoanDays", { days: days(s.loan_days) }),
          s.renewals_allowed > 0
            ? s.renewals_allowed === 1
              ? t("catalog.rulesRenewOnce", { days: days(s.renewal_days) })
              : t("catalog.rulesRenewMany", {
                  times: fmtNum(s.renewals_allowed, lang),
                  days: days(s.renewal_days),
                })
            : t("catalog.rulesRenewNone"),
          ...(closed.length
            ? [
                t("catalog.rulesClosedDays", { days: closed.join(", ") }),
                t("catalog.rulesClosedShift"),
              ]
            : []),
        ],
      }
    : tbcOnly("loan", "catalog.rulesLoan");

  return [
    {
      id: "membership",
      title: t("catalog.rulesMembership"),
      body: [t("catalog.rulesMembershipFree"), t("catalog.rulesMembershipTbc", { tbc })],
    },
    {
      id: "borrowing",
      title: t("catalog.rulesBorrowing"),
      body: [
        t("catalog.rulesBorrowingHow"),
        t("catalog.rulesBorrowingFree"),
        ...(s ? [t("catalog.rulesItemLimit", { max: fmtNum(s.max_items, lang) })] : []),
      ],
    },
    s
      ? {
          id: "holds",
          title: t("catalog.rulesHolds"),
          body: [
            t("catalog.rulesHoldsBody", {
              window: days(s.pickup_window_days),
              grace: days(s.hold_grace_days),
            }),
          ],
        }
      : tbcOnly("holds", "catalog.rulesHolds"),
    loan,
    tbcOnly("returns", "catalog.rulesReturns"),
    {
      id: "overdue",
      title: t("catalog.rulesOverdue"),
      body: [
        t("catalog.rulesOverdueAccount"),
        s
          ? t("catalog.rulesFine", { amount: `৳${fmtNum(s.fine_per_day, lang)}` })
          : t("catalog.rulesFineTbc", { tbc }),
      ],
    },
    tbcOnly("care", "catalog.rulesCare"),
    tbcOnly("lost", "catalog.rulesLost"),
    {
      id: "guarantor",
      title: t("catalog.rulesGuarantor"),
      body: [t("catalog.rulesGuarantorBody"), t("catalog.rulesGuarantorTbc", { tbc })],
    },
    {
      id: "digital",
      title: t("catalog.rulesDigital"),
      body: [t("catalog.rulesDigitalBody"), t("catalog.rulesDigitalTbc", { tbc })],
    },
    tbcOnly("conduct", "catalog.rulesConduct"),
    tbcOnly("privacy", "catalog.rulesPrivacy"),
    { id: "contact", title: t("catalog.rulesContact"), body: [t("catalog.rulesContactBody")] },
  ];
}

function Rules() {
  const { t, lang } = useApp();
  const { settings, error } = Route.useLoaderData();
  const sections = buildSections(t, lang, settings);
  return (
    <>
      <PageIntro eyebrow={t("catalog.rulesEyebrow")} title={t("catalog.rulesTitle")}>
        {t("catalog.rulesIntro")}
      </PageIntro>
      <section className="container-page grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav
          aria-label={t("catalog.rulesContents")}
          className="lg:sticky lg:top-[calc(var(--hdr,109px)+1.5rem)] lg:self-start"
        >
          <details className="border-y border-border py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">
              {t("catalog.rulesContents")}
            </summary>
            <Toc sections={sections} />
          </details>
          <div className="hidden lg:block">
            <div className="eyebrow mb-3">{t("catalog.rulesContents")}</div>
            <Toc sections={sections} />
          </div>
        </nav>
        <div className="max-w-2xl">
          <p className="mb-10 border-l-2 border-accent pl-4 text-sm text-muted-foreground">
            {t("catalog.rulesTbcNote")}
          </p>
          {error && (
            <p role="alert" className="mb-10 border-l-2 border-destructive pl-4 text-sm">
              {t("catalog.rulesLoadError", { error })}
            </p>
          )}
          <ol className="divide-y divide-border border-y border-border">
            {sections.map((s, i) => (
              <li key={s.id} id={s.id} className="scroll-mt-32 py-8">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
                  <span className="font-display text-xl text-accent tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-2xl md:text-3xl">{s.title}</h2>
                    {s.body.map((p) => (
                      <p
                        key={p}
                        className={`mt-3 font-display text-lg leading-relaxed ${s.pending ? "italic text-muted-foreground" : ""}`}
                      >
                        {p}
                      </p>
                    ))}
                    {s.id === "contact" && (
                      <Link
                        to="/contact"
                        className="mt-4 inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:text-accent"
                      >
                        {t("catalog.rulesContactLink")} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
            <p className="font-display text-2xl">{t("catalog.rulesCta")}</p>
            <Button size="lg" asChild>
              <Link to="/library/books">
                {t("catalog.rulesExplore")} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Toc({ sections }: { sections: Section[] }) {
  return (
    <ol className="mt-3 space-y-1.5 text-sm">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] text-muted-foreground hover:text-foreground"
          >
            <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

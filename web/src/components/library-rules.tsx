import { useEffect, useState } from "react";
import { fmtNum, getPublicSettings, type BookLang, type PublicSettings } from "@/lib/books";
import type { TKey, TVars } from "@/lib/i18n";
import { describeError } from "@/lib/supabase";

/** Loads the policy numbers client-side, for pages that are not routed through the rules loader. */
export function useRuleSettings() {
  const [state, setState] = useState<{ settings: PublicSettings | null; error: string | null }>({
    settings: null,
    error: null,
  });
  useEffect(() => {
    let live = true;
    getPublicSettings()
      .then((settings) => live && setState({ settings, error: null }))
      .catch((err) => live && setState({ settings: null, error: describeError(err) }));
    return () => {
      live = false;
    };
  }, []);
  return state;
}

export type Section = { id: string; title: string; body: string[]; pending?: boolean };

const weekdayName = (dow: number, lang: BookLang) =>
  new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 7 + dow))); // 7 Jan 2024 was a Sunday (Postgres DOW 0)

/**
 * Only what the database settings and the existing pages state as fact is written as fact;
 * everything else stays "to be confirmed". Never invent policy here.
 */
export function buildSections(
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

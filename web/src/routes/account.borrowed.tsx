import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/noholi";
import {
  BookThumb,
  DetailsLink,
  ErrorState,
  ListSkeleton,
  ToneBadge,
} from "@/components/record-view";
import { useAuth, type MemberRow } from "@/lib/auth";
import { daysBetween, todayDhaka } from "@/lib/dhaka-date";
import {
  bookAuthorOf,
  bookTitleOf,
  loanStatusView,
  myLoans,
  publicSettings,
  renewLoan,
  useFmt,
  useLoad,
  type LoanWithBook,
  type PublicSettings,
} from "@/lib/lending";
import { useApp } from "@/lib/store";
import { describeError } from "@/lib/supabase";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/borrowed")({
  validateSearch: z.object({ tab: z.enum(["current", "history"]).optional() }),
  head: () => ({
    meta: [
      { title: "Borrowed books — My Noholi" },
      {
        name: "description",
        content: "View your current Noholi loans, return dates and borrow history.",
      },
      { property: "og:title", content: "Borrowed books — My Noholi" },
      {
        property: "og:description",
        content: "View your current Noholi loans, return dates and borrow history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Borrowed,
});

/** Why a loan can't be renewed online (null = the Renew button is offered). The database has the final say (NH013 / NH007). */
function renewBlock(
  l: LoanWithBook,
  s: PublicSettings,
  m: MemberRow | null,
): { key: TKey; vars?: Record<string, string | number> } | null {
  if (l.derived_status === "Overdue") return { key: "lending.loans.renewOverdue" };
  if (l.derived_status !== "Active") return null;
  if (s.renewals_allowed === 0) return { key: "lending.loans.renewDesk" };
  if (l.renewal_count >= s.renewals_allowed) return { key: "lending.loans.renewUsed" };
  if (m && (m.status !== "Active" || m.overdue_loans > 0 || m.outstanding_fines > 0))
    return { key: "lending.loans.renewPaused" };
  return null;
}

function Borrowed() {
  const { tab = "current" } = Route.useSearch();
  const { t } = useApp();
  const { ready } = useAuth();
  const { data, error, loading, reload, refresh } = useLoad(
    async () => {
      const [loans, settings] = await Promise.all([myLoans(), publicSettings()]);
      return { loans, settings };
    },
    [],
    ready,
  );

  const current = (data?.loans ?? [])
    .filter((l) => l.derived_status === "Active" || l.derived_status === "Overdue")
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const history = (data?.loans ?? [])
    .filter((l) => l.derived_status !== "Active" && l.derived_status !== "Overdue")
    .sort((a, b) => (b.return_date ?? b.due_date).localeCompare(a.return_date ?? a.due_date));

  return (
    <>
      <h1 className="text-4xl">{t("lending.loans.title")}</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        {t("lending.loans.intro")}{" "}
        <Link to="/account/requests" className="underline underline-offset-2">
          {t("lending.loans.introLink")}
        </Link>
        .
      </p>
      <nav className="mb-8 flex gap-2" aria-label={t("lending.loans.title")}>
        {(
          [
            ["current", t("lending.loans.tabCurrent"), current.length],
            ["history", t("lending.loans.tabHistory"), history.length],
          ] as const
        ).map(([v, l, n]) => (
          <Link
            key={v}
            to="/account/borrowed"
            search={v === "current" ? {} : { tab: v }}
            aria-current={tab === v ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              tab === v ? "border-foreground bg-foreground text-background" : "border-border",
            )}
          >
            {l} {data && <span className="tabular-nums opacity-60">{n}</span>}
          </Link>
        ))}
      </nav>
      {loading ? (
        <ListSkeleton />
      ) : error || !data ? (
        <ErrorState
          title={t("lending.loadError")}
          message={error ?? ""}
          retryLabel={t("lending.retry")}
          onRetry={reload}
        />
      ) : (
        <Rows
          list={tab === "current" ? current : history}
          history={tab === "history"}
          settings={data.settings}
          onChanged={refresh}
        />
      )}
    </>
  );
}

function Rows({
  list,
  history,
  settings,
  onChanged,
}: {
  list: LoanWithBook[];
  history?: boolean;
  settings: PublicSettings;
  onChanged: () => Promise<void>;
}) {
  const { t, lang } = useApp();
  const { member, refreshMember } = useAuth();
  const fmt = useFmt();
  const [working, setWorking] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; text: string } | null>(null);
  const busy = useRef(false);

  const renew = async (l: LoanWithBook, title: string) => {
    if (busy.current) return;
    busy.current = true;
    setWorking(l.id);
    setRowError(null);
    try {
      const row = await renewLoan(l.id);
      toast.success(t("lending.loans.renewedToast", { title, date: fmt.date(row.due_date) }));
      await Promise.all([onChanged(), refreshMember()]);
    } catch (err) {
      console.error(err);
      setRowError({ id: l.id, text: describeError(err) });
    } finally {
      busy.current = false;
      setWorking(null);
    }
  };

  if (!list.length)
    return (
      <Empty
        title={t(history ? "lending.loans.emptyHistoryTitle" : "lending.loans.emptyCurrentTitle")}
        body={t(history ? "lending.loans.emptyHistoryBody" : "lending.loans.emptyCurrentBody")}
        action={
          <Button variant="outline" asChild>
            <Link to="/library/books">{t("lending.browseBooks")}</Link>
          </Button>
        }
      />
    );

  const cols = history
    ? "md:grid-cols-[56px_minmax(0,1fr)_110px_110px_110px_130px_110px]"
    : "md:grid-cols-[56px_minmax(0,1fr)_110px_130px_150px_130px]";
  const today = todayDhaka();

  return (
    <div className="divide-y divide-border border-y border-border">
      <div className={cn("hidden gap-5 py-3 text-xs text-muted-foreground md:grid", cols)}>
        <span />
        <span>{t("lending.loans.colBook")}</span>
        <span>{t("lending.loans.colIssued")}</span>
        <span>{t("lending.loans.colDue")}</span>
        {history && <span>{t("lending.loans.colReturned")}</span>}
        <span>{t("lending.loans.colStatus")}</span>
        <span />
      </div>
      {list.map((l) => {
        const title = bookTitleOf(l.book, lang, l.book_title);
        const sv = loanStatusView(l.derived_status);
        const left = daysBetween(today, l.due_date);
        const block = history ? null : renewBlock(l, settings, member);
        const canRenew = !history && l.derived_status === "Active" && !block;
        return (
          <div
            key={l.id}
            className={cn(
              "grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-5 gap-y-1.5 py-5 md:items-center",
              cols,
            )}
          >
            <BookThumb book={l.book} fallbackTitle={l.book_title} size="sm" />
            <div className="min-w-0">
              <Link
                to="/book/$id"
                params={{ id: l.book_id }}
                className="break-words font-display text-lg leading-snug hover:text-accent"
              >
                {title}
              </Link>
              <div className="break-words text-sm text-muted-foreground">
                {bookAuthorOf(l.book, lang)}
              </div>
              <div className="font-mono text-xs text-muted-foreground">{l.id}</div>
            </div>
            <span className="col-start-2 text-sm md:col-start-auto">
              <span className="text-muted-foreground md:hidden">{t("lending.loans.issued")}</span>
              {fmt.date(l.issued_date)}
            </span>
            <span className="col-start-2 text-sm md:col-start-auto">
              <span className="text-muted-foreground md:hidden">{t("lending.loans.due")}</span>
              {fmt.date(l.due_date)}
              {!history && l.derived_status === "Active" && (
                <span className="block text-xs text-muted-foreground">
                  {left === 0
                    ? t("lending.loans.dueToday")
                    : left === 1
                      ? t("lending.loans.dueTomorrow")
                      : t("lending.loans.dueIn", { n: left })}
                </span>
              )}
              {l.renewal_count > 0 && (
                <span className="block text-xs text-muted-foreground">
                  {t("lending.loans.renewedTimes", { n: l.renewal_count })}
                </span>
              )}
            </span>
            {history && (
              <span className="col-start-2 text-sm md:col-start-auto">
                <span className="text-muted-foreground md:hidden">
                  {t("lending.loans.returned")}
                </span>
                {l.return_date ? fmt.date(l.return_date) : "—"}
              </span>
            )}
            <span className="col-start-2 min-w-0 md:col-start-auto">
              <ToneBadge label={t(sv.key)} tone={sv.tone} />
              {l.derived_status === "Overdue" && (
                <span className="mt-1 block break-words text-xs text-muted-foreground">
                  {t("lending.loans.overdueBy", { n: l.days_overdue })}
                  {Number(l.fine_amount) > 0 &&
                    ` · ${t("lending.loans.fineSoFar", { amount: fmt.taka(l.fine_amount) })}`}
                </span>
              )}
            </span>
            <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 md:col-start-auto md:flex-col md:items-end md:gap-2">
              {canRenew && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={working !== null}
                  onClick={() => void renew(l, title)}
                  title={t("lending.loans.renewHint", { days: settings.renewal_days })}
                >
                  {working === l.id ? t("lending.loans.renewing") : t("lending.loans.renew")}
                </Button>
              )}
              {block && (
                <span className="text-xs text-muted-foreground md:text-right">{t(block.key)}</span>
              )}
              <DetailsLink to="/account/requests/$id" params={{ id: l.request_id ?? l.id }}>
                {t("lending.viewDetails")}
              </DetailsLink>
            </div>
            {rowError?.id === l.id && (
              <p
                role="alert"
                className="col-start-2 col-end-[-1] break-words border-l-2 border-destructive pl-3 text-sm text-muted-foreground"
              >
                <span className="font-medium text-destructive">
                  {t("lending.loans.renewFailed")}:{" "}
                </span>
                {rowError.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

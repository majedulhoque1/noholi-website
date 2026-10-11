import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty } from "@/components/noholi";
import { DetailsLink, ErrorState, ToneBadge } from "@/components/record-view";
import { useAuth } from "@/lib/auth";
import {
  bookTitleOf,
  fineBalance,
  fineStatusView,
  myFines,
  myOverdueLoans,
  useFmt,
  useLoad,
} from "@/lib/lending";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/fines")({
  head: () => ({
    meta: [
      { title: "Overdue & Fines — My Noholi" },
      {
        name: "description",
        content: "Review overdue loans and library fine information at Noholi.",
      },
      { property: "og:title", content: "Overdue & Fines — My Noholi" },
      {
        property: "og:description",
        content: "Review overdue loans and library fine information at Noholi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fines,
});

function Fines() {
  const { t, lang } = useApp();
  const { ready } = useAuth();
  const fmt = useFmt();
  const { data, error, loading, reload } = useLoad(
    async () => {
      const [fines, overdue] = await Promise.all([myFines(), myOverdueLoans()]);
      return { fines, overdue };
    },
    [],
    ready,
  );

  const settled = (data?.fines ?? []).reduce((s, f) => s + fineBalance(f), 0);
  const accruing = (data?.overdue ?? []).reduce(
    (s, l) => s + (l.fine_is_accruing ? Number(l.fine_amount) : 0),
    0,
  );
  const total = settled + accruing;

  return (
    <>
      <h1 className="text-4xl">{t("lending.fines.title")}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-sm text-muted-foreground">
        {t("lending.fines.intro")}
      </p>
      {loading ? (
        <div className="space-y-4" role="status" aria-busy="true">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error || !data ? (
        <ErrorState
          title={t("lending.loadError")}
          message={error ?? ""}
          retryLabel={t("lending.retry")}
          onRetry={reload}
        />
      ) : (
        <>
          <div className="grid gap-6 border-y border-foreground py-8 md:grid-cols-2">
            <div>
              <div className="eyebrow">{t("lending.fines.outstanding")}</div>
              <div className="mt-2 font-display text-6xl">{fmt.taka(total)}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {total > 0 ? t("lending.fines.some") : t("lending.fines.none")}
                {accruing > 0 && (
                  <span className="block">
                    {t("lending.fines.accruingNote", { amount: fmt.taka(accruing) })}
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="eyebrow">{t("lending.fines.overdueNow")}</div>
              {data.overdue.length ? (
                <ul className="mt-3 space-y-3 text-sm">
                  {data.overdue.map((l) => (
                    <li key={l.id} className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="min-w-0 break-words">
                          <span className="font-display text-lg">{l.book_title}</span>{" "}
                          <span className="text-muted-foreground">
                            · {t("lending.fines.dueOn", { date: fmt.date(l.due_date) })}
                          </span>
                        </span>
                        <DetailsLink
                          to="/account/requests/$id"
                          params={{ id: l.request_id ?? l.id }}
                        >
                          {t("lending.fines.loanLink", { id: l.id })}
                        </DetailsLink>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("lending.fines.accruing", {
                          amount: fmt.taka(l.fine_amount),
                          n: l.days_overdue,
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("lending.fines.nothingOverdue")}
                </p>
              )}
            </div>
          </div>
          {data.fines.length === 0 ? (
            <div className="mt-10">
              <Empty
                title={t("lending.fines.emptyTitle")}
                body={t("lending.fines.emptyBody")}
                action={
                  <Button variant="outline" asChild>
                    <Link to="/account/borrowed">{t("lending.loans.title")}</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-10 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 pr-3 font-normal">{t("lending.fines.colFine")}</th>
                    <th className="pr-3 font-normal">{t("lending.fines.colBook")}</th>
                    <th className="hidden pr-3 font-normal md:table-cell">
                      {t("lending.fines.colReason")}
                    </th>
                    <th className="hidden pr-3 font-normal sm:table-cell">
                      {t("lending.fines.colDue")}
                    </th>
                    <th className="pr-3 font-normal">{t("lending.fines.colAmount")}</th>
                    <th className="hidden pr-3 font-normal sm:table-cell">
                      {t("lending.fines.colOutstanding")}
                    </th>
                    <th className="pr-3 font-normal">{t("lending.fines.colStatus")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.fines.map((f) => {
                    const sv = fineStatusView(f.status);
                    return (
                      <tr key={f.id} className="border-b border-border align-top">
                        <td className="py-4 pr-3 font-mono text-xs text-muted-foreground">
                          {f.id}
                        </td>
                        <td className="max-w-[16rem] break-words pr-3 font-display text-base">
                          {bookTitleOf(f.book, lang, f.loan?.book_title ?? "")}
                        </td>
                        <td className="hidden pr-3 md:table-cell">
                          {f.kind === "Lost"
                            ? t("lending.fines.reasonLost")
                            : f.days_overdue
                              ? t("lending.fines.reasonOverdue", { n: f.days_overdue })
                              : t("lending.fines.reasonOverdueNoDays")}
                        </td>
                        <td className="hidden pr-3 sm:table-cell">{fmt.date(f.loan?.due_date)}</td>
                        <td className="pr-3 tabular-nums">{fmt.taka(f.amount)}</td>
                        <td className="hidden pr-3 tabular-nums sm:table-cell">
                          {fmt.taka(fineBalance(f))}
                        </td>
                        <td className="pr-3">
                          <ToneBadge label={t(sv.key)} tone={sv.tone} />
                        </td>
                        <td className="text-right">
                          <DetailsLink to="/account/fines/$id" params={{ id: f.id }}>
                            {t("lending.fines.details")}
                          </DetailsLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

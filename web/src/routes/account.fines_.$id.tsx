import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BackLink,
  BookThumb,
  ErrorState,
  Fields,
  NotFoundRecord,
  RecordHeader,
  Section,
  ToneBadge,
} from "@/components/record-view";
import { useAuth } from "@/lib/auth";
import { bookTitleOf, fineBalance, fineStatusView, myFine, useFmt, useLoad } from "@/lib/lending";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/fines_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Fine — My Noholi` },
      { name: "description", content: "Details and payment history for a Noholi library fine." },
      { property: "og:title", content: `${params.id} — Fine` },
      {
        property: "og:description",
        content: "Details and payment history for a Noholi library fine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FineDetailPage,
});

function FineDetailPage() {
  const { id } = Route.useParams();
  const { t, lang } = useApp();
  const { ready } = useAuth();
  const fmt = useFmt();
  const { data, error, loading, reload } = useLoad(() => myFine(id), [id], ready);
  const back = <BackLink to="/account/fines" label={t("lending.fines.backToFines")} />;

  if (loading)
    return (
      <div className="max-w-5xl space-y-6" role="status" aria-busy="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (error)
    return (
      <div className="max-w-2xl py-8">
        {back}
        <div className="mt-6">
          <ErrorState
            title={t("lending.loadError")}
            message={error}
            retryLabel={t("lending.retry")}
            onRetry={reload}
          />
        </div>
      </div>
    );
  if (!data)
    return (
      <NotFoundRecord
        what="Fine"
        back={back}
        title={t("lending.notFoundTitle")}
        body={t("lending.notFoundBody")}
      />
    );

  const { fine: f, loan, book, payments, waiver } = data;
  const out = fineBalance(f);
  const sv = fineStatusView(f.status);
  const title = bookTitleOf(book, lang, loan?.book_title ?? "");

  return (
    <article className="max-w-5xl">
      <RecordHeader
        back={back}
        eyebrow={t("lending.fines.eyebrow")}
        title={f.kind === "Lost" ? t("lending.fines.titleLost") : t("lending.fines.titleOverdue")}
        ids={[{ label: t("lending.fines.colFine"), value: f.id }]}
        status={t(sv.key)}
        statusBadge={<ToneBadge label={t(sv.key)} tone={sv.tone} className="text-sm" />}
        statusNote={
          out > 0
            ? t("lending.fines.notePay")
            : f.status === "Waived"
              ? t("lending.fines.noteWaived")
              : f.status === "Voided"
                ? t("lending.fines.noteVoided")
                : t("lending.fines.noteCleared")
        }
        formatDate={fmt.date}
        dates={[{ label: t("lending.fines.recorded"), value: f.created_at }]}
      />
      <Section n="A" title={t("lending.fines.secLoan")}>
        <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-5">
          <BookThumb book={book} fallbackTitle={loan?.book_title ?? ""} size="sm" />
          <div className="min-w-0">
            <div className="break-words font-display text-lg">{title}</div>
            <Fields
              className="mt-2"
              rows={[
                [
                  t("lending.fines.loanId"),
                  loan && (
                    <Link
                      to="/account/requests/$id"
                      params={{ id: loan.id }}
                      className="font-mono underline underline-offset-4 hover:text-accent"
                    >
                      {loan.id}
                    </Link>
                  ),
                ],
                [t("lending.fines.dueDate"), loan && fmt.date(loan.due_date)],
                [t("lending.fines.returned"), loan?.return_date && fmt.date(loan.return_date)],
                [
                  t("lending.fines.overdueDays"),
                  f.days_overdue
                    ? t("lending.fines.daysRecorded", { n: f.days_overdue })
                    : undefined,
                ],
              ]}
            />
          </div>
        </div>
      </Section>
      <Section n="B" title={t("lending.fines.secAmount")}>
        <Fields
          rows={[
            [t("lending.fines.amount"), fmt.taka(f.amount)],
            [t("lending.fines.paid"), fmt.taka(f.amount_paid)],
            [waiver ? t("lending.fines.waived") : "", waiver && fmt.taka(waiver.amount_waived)],
            [t("lending.fines.waiverNote"), waiver?.reason],
            [t("lending.fines.colOutstanding"), <strong>{fmt.taka(out)}</strong>],
          ]}
        />
      </Section>
      <Section n="C" title={t("lending.fines.secPayments")}>
        {payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-normal">{t("lending.fines.payDate")}</th>
                  <th className="pr-3 font-normal">{t("lending.fines.payAmount")}</th>
                  <th className="pr-3 font-normal">{t("lending.fines.payMethod")}</th>
                  <th className="font-normal">{t("lending.fines.payReceipt")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-3">{fmt.dateTime(p.paid_at)}</td>
                    <td className="pr-3 tabular-nums">{fmt.taka(p.amount)}</td>
                    <td className="pr-3">{p.method}</td>
                    <td className="break-all font-mono text-xs">{p.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("lending.fines.noPayments")}</p>
        )}
      </Section>
      <div className="flex flex-wrap gap-2 py-8">
        <Button variant="outline" asChild>
          <Link to="/contact">{t("lending.contactLibrary")}</Link>
        </Button>
      </div>
    </article>
  );
}

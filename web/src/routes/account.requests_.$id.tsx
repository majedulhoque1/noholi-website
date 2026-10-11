import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Initials } from "@/components/noholi";
import {
  BackLink,
  BookThumb,
  ErrorState,
  Fields,
  maskNid,
  NotFoundRecord,
  RecordHeader,
  Section,
  Timeline,
  ToneBadge,
  type Row,
} from "@/components/record-view";
import { useAuth } from "@/lib/auth";
import type { RecordEvent } from "@/lib/data";
import {
  bookAuthorOf,
  bookTitleOf,
  cancelRequest,
  fineBalance,
  last4,
  loanStatusView,
  myBorrowRecord,
  requestStatusView,
  useFmt,
  useLoad,
  type BorrowRecord,
} from "@/lib/lending";
import { useApp } from "@/lib/store";
import { describeError } from "@/lib/supabase";

export const Route = createFileRoute("/account/requests_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Borrow record — My Noholi` },
      {
        name: "description",
        content: "Details, guarantor and timeline for one of your Noholi borrow requests or loans.",
      },
      { property: "og:title", content: `${params.id} — Borrow record` },
      {
        property: "og:description",
        content: "Details, guarantor and timeline for one of your Noholi borrow records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BorrowRecordPage,
});

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function RecordSkeleton() {
  return (
    <div className="max-w-5xl space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function BorrowRecordPage() {
  const { id } = Route.useParams();
  const { t } = useApp();
  const { ready } = useAuth();
  const { data, error, loading, reload, refresh } = useLoad(() => myBorrowRecord(id), [id], ready);
  const back = <BackLink to="/account/requests" label={t("lending.req.backToRequests")} />;

  if (loading) return <RecordSkeleton />;
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
        what="Borrow record"
        back={back}
        title={t("lending.notFoundTitle")}
        body={t("lending.notFoundBody")}
      />
    );
  return <RecordBody rec={data} back={back} onChanged={refresh} />;
}

function RecordBody({
  rec,
  back,
  onChanged,
}: {
  rec: BorrowRecord;
  back: ReactNode;
  onChanged: () => Promise<void>;
}) {
  const { t, lang } = useApp();
  const { member, refreshMember } = useAuth();
  const fmt = useFmt();
  const { request: req, loan, fine, book } = rec;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fallbackTitle = req?.book_title ?? loan?.book_title ?? "";
  const title = bookTitleOf(book, lang, fallbackTitle);
  const author = bookAuthorOf(book, lang);
  const fmtAny = (d: string) => (ISO_DAY.test(d) ? fmt.date(d) : fmt.dateTime(d));

  const headStatus = loan ? loanStatusView(loan.derived_status) : requestStatusView(req!.status);

  // Timeline from row timestamps only.
  const events: RecordEvent[] = [];
  if (req) {
    events.push({
      date: req.created_at,
      label: t("lending.req.tlSubmitted"),
      note: t("lending.req.tlSubmittedNote", { date: fmt.date(req.pickup_date) }),
    });
    if (req.status === "Rejected")
      events.push({
        date: req.decided_at ?? req.created_at,
        label: t("lending.req.tlRejected"),
        note: req.reason ?? undefined,
      });
    if (req.status === "Expired")
      events.push({
        date: req.decided_at ?? req.expires_at,
        label: t("lending.req.tlExpired"),
        note: req.reason ?? undefined,
      });
    if (req.status === "Cancelled")
      events.push({
        date: req.decided_at ?? req.created_at,
        label: t("lending.req.tlCancelled"),
      });
    if (req.status === "Issued" && (req.decided_at || loan))
      events.push({
        date: (req.decided_at ?? loan?.issued_date)!,
        label: t("lending.req.tlIssued", { id: req.loan_id ?? loan?.id ?? "" }),
      });
  } else if (loan) {
    events.push({ date: loan.issued_date, label: t("lending.req.tlLoanIssued") });
  }
  if (loan?.status === "Returned" && loan.return_date)
    events.push({ date: loan.return_date, label: t("lending.req.tlReturned") });
  if (loan?.status === "Lost")
    events.push({
      date: loan.closed_at ?? loan.return_date ?? loan.due_date,
      label: t("lending.req.tlLost"),
    });
  events.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  let statusNote: string | undefined;
  if (req) {
    statusNote =
      req.status === "Pending"
        ? t("lending.req.noteOnHold", { date: fmt.date(req.expires_at) })
        : req.status === "Issued"
          ? t("lending.req.noteIssued")
          : req.status === "Rejected"
            ? `${t("lending.req.noteRejected")}${req.reason ? ` ${req.reason}` : ""}`
            : req.status === "Expired"
              ? t("lending.req.noteExpired")
              : t("lending.req.noteCancelled");
  }

  const g = req ?? loan;
  const gAddress = g
    ? [g.guarantor_street, g.guarantor_city, g.guarantor_district, g.guarantor_postal_code]
        .filter(Boolean)
        .join(", ")
    : "";

  const fineRow: Row[1] = fine ? (
    <Link
      to="/account/fines/$id"
      params={{ id: fine.id }}
      className="underline underline-offset-4 hover:text-accent"
    >
      {fine.id} · {fmt.taka(fine.amount)} ·{" "}
      {fineBalance(fine) > 0
        ? t("lending.req.fineOutstanding", { amount: fmt.taka(fineBalance(fine)) })
        : t("lending.req.fineSettled")}
    </Link>
  ) : loan && loan.fine_is_accruing && Number(loan.fine_amount) > 0 ? (
    t("lending.loans.fineSoFar", { amount: fmt.taka(loan.fine_amount) })
  ) : loan ? (
    t("lending.req.fineNone")
  ) : undefined;

  const doCancel = async () => {
    if (!req || cancelling) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelRequest(req.id);
      toast.success(t("lending.req.cancelledToast", { id: req.id }));
      setConfirmOpen(false);
      await Promise.all([onChanged(), refreshMember()]);
    } catch (err) {
      console.error(err);
      setCancelError(describeError(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="max-w-5xl">
      <RecordHeader
        back={back}
        eyebrow={loan ? t("lending.req.eyebrowLoan") : t("lending.req.eyebrowRequest")}
        title={title}
        ids={[
          ...(req ? [{ label: t("lending.borrow.requestId"), value: req.id }] : []),
          ...(loan ? [{ label: t("lending.fines.loanId"), value: loan.id }] : []),
        ]}
        status={t(headStatus.key)}
        statusBadge={
          <ToneBadge label={t(headStatus.key)} tone={headStatus.tone} className="text-sm" />
        }
        statusNote={statusNote}
        formatDate={fmtAny}
        dates={[
          { label: t("lending.req.requestDate"), value: req?.created_at ?? loan?.created_at },
          { label: t("lending.req.issueDate"), value: loan?.issued_date },
        ]}
      />

      <Section n="A" title={t("lending.req.secBook")}>
        <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-5">
          <BookThumb book={book} fallbackTitle={fallbackTitle} size="sm" />
          <div className="min-w-0">
            <div className="break-words font-display text-lg">{title}</div>
            <Fields
              className="mt-3"
              rows={[
                [t("lending.req.author"), author],
                [
                  t("lending.req.bookId"),
                  <span className="font-mono">{book?.id ?? req?.book_id ?? loan?.book_id}</span>,
                ],
                [t("lending.req.genre"), [book?.genre, book?.category].filter(Boolean).join(" · ")],
                [t("lending.req.language"), book?.language],
                [
                  t("lending.req.publication"),
                  [book?.publisher, book?.year_of_publication].filter(Boolean).join(", "),
                ],
              ]}
            />
            {book && (
              <Link
                to="/book/$id"
                params={{ id: book.id }}
                className="mt-3 inline-block text-sm underline underline-offset-4 hover:text-accent"
              >
                {t("lending.openBookPage")}
              </Link>
            )}
          </div>
        </div>
      </Section>

      <Section n="B" title={t("lending.req.secBorrowing")}>
        <Fields
          rows={[
            [t("lending.req.requestDate"), req && fmt.date(req.created_at)],
            [t("lending.req.pickupDate"), req && fmt.date(req.pickup_date)],
            [
              t("lending.req.holdUntil"),
              req && (req.status === "Pending" || req.status === "Expired")
                ? fmt.date(req.expires_at)
                : undefined,
            ],
            [t("lending.req.reason"), req?.reason],
            [t("lending.borrow.noteRow"), req?.note],
            [t("lending.req.issueDate"), loan && fmt.date(loan.issued_date)],
            [t("lending.req.dueDate"), loan && fmt.date(loan.due_date)],
            [t("lending.req.returned"), loan?.return_date && fmt.date(loan.return_date)],
            [
              t("lending.req.loanStatus"),
              loan && (
                <ToneBadge
                  label={t(loanStatusView(loan.derived_status).key)}
                  tone={loanStatusView(loan.derived_status).tone}
                />
              ),
            ],
            [t("lending.req.renewals"), loan ? String(loan.renewal_count) : undefined],
            [t("lending.req.fee"), t("lending.req.feeFree")],
            [t("lending.req.fine"), fineRow],
          ]}
        />
      </Section>

      <Section
        n="C"
        title={t("lending.req.secMember")}
        aside={<p className="mt-2 text-xs text-muted-foreground">{t("lending.req.memberAside")}</p>}
      >
        <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-5">
          <Initials name={req?.member_name ?? member?.name ?? ""} className="h-14 w-14 text-2xl" />
          <Fields
            rows={[
              [t("lending.req.memberName"), req?.member_name ?? member?.name],
              [
                t("lending.req.memberId"),
                <span className="font-mono">{req?.member_id ?? loan?.member_id}</span>,
              ],
              [t("lending.req.memberNid"), maskNid(last4(req?.member_nid))],
              [t("lending.req.memberPhone"), member?.phone],
              [t("lending.req.memberEmail"), member?.email],
              [
                t("lending.req.memberAddress"),
                [member?.address_line, member?.city, member?.district, member?.postal_code]
                  .filter(Boolean)
                  .join(", "),
              ],
            ]}
          />
        </div>
      </Section>

      <Section
        n="D"
        title={t("lending.req.secGuarantor")}
        aside={
          <p className="mt-2 text-xs text-muted-foreground">{t("lending.req.guarantorAside")}</p>
        }
      >
        <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-5">
          <Initials name={g?.guarantor_name ?? ""} className="h-14 w-14 text-2xl" />
          <div className="min-w-0">
            {g?.guarantor_name ? (
              <Fields
                rows={[
                  [t("lending.req.memberName"), g.guarantor_name],
                  [t("lending.req.gRelationship"), g.guarantor_relationship],
                  [t("lending.req.memberPhone"), g.guarantor_phone],
                  [t("lending.req.memberEmail"), g.guarantor_email],
                  [t("lending.req.memberAddress"), gAddress],
                  [t("lending.req.memberNid"), maskNid(last4(g.guarantor_nid))],
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("lending.notOnRecord")}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{t("lending.req.gMask")}</p>
          </div>
        </div>
      </Section>

      <Section n="E" title={t("lending.req.secTimeline")}>
        <Timeline events={events} formatDate={fmtAny} />
      </Section>

      <div className="flex flex-wrap gap-2 py-8">
        {book && (
          <Button variant="outline" asChild>
            <Link to="/book/$id" params={{ id: book.id }}>
              {t("lending.viewBook")}
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/contact">{t("lending.contactLibrary")}</Link>
        </Button>
        {req?.status === "Pending" && (
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              setCancelError(null);
              setConfirmOpen(true);
            }}
          >
            {t("lending.req.cancel")}
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(o) => !cancelling && setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("lending.req.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              {t("lending.req.cancelBody", { title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelError && (
            <div className="border border-destructive/50 p-3 text-sm" role="alert">
              <div className="font-medium text-destructive">{t("lending.req.cancelFailed")}</div>
              <p className="mt-1 break-words text-muted-foreground">{cancelError}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              {t("lending.req.cancelKeep")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              onClick={(e) => {
                e.preventDefault(); // stay open until the request finishes
                void doCancel();
              }}
            >
              {cancelling ? t("lending.req.cancelling") : t("lending.req.cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

import { useMemo, useState } from "react";
import { RotateCcw, Eye, CalendarPlus, Loader2, XCircle, SearchX, Pencil } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueBookForm } from "@/components/lending/IssueBookForm";
import { LoanDetailModal } from "@/components/lending/LoanDetailModal";
import { ExtendLoanDialog } from "@/components/lending/ExtendLoanDialog";
import { EditLoanDetailsDialog } from "@/components/lending/EditLoanDetailsDialog";
import { ReturnLoanDialog } from "@/components/lending/ReturnLoanDialog";
import { ReasonDialog } from "@/components/lending/ReasonDialog";
import { WebRequestsTable } from "@/components/lending/WebRequestsTable";
import { LOAN_STATUS_VARIANT } from "@/components/lending/loan-status";
import { useCanWrite } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import {
  useLoans, useBorrowRequests, useLibrarySettings,
  type ActiveLoan, type LoanStatus, type IssueLoanInput,
} from "@/hooks/use-loans";
import { formatDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Tab = LoanStatus | "Requests";
const LOAN_TABS: LoanStatus[] = ["Active", "Overdue", "Returned", "Cancelled", "Lost"];

export default function Lending() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const settings = useLibrarySettings();
  const { loans, loading, error, issueLoan, returnLoan, voidLoan, markLost, extendLoan, updateLoanDetails, refetch } = useLoans();
  const reqs = useBorrowRequests(refetch);

  const [tab, setTab] = useState<Tab>("Active");
  const [loanSearch, setLoanSearch] = useState("");
  const [detailLoan, setDetailLoan] = useState<ActiveLoan | null>(null);
  const [extendTarget, setExtendTarget] = useState<ActiveLoan | null>(null);
  const [editTarget, setEditTarget] = useState<ActiveLoan | null>(null);
  const [returnTarget, setReturnTarget] = useState<ActiveLoan | null>(null);
  const [voidTarget, setVoidTarget] = useState<ActiveLoan | null>(null);
  const [lostTarget, setLostTarget] = useState<ActiveLoan | null>(null);

  const today = settings?.today ?? "";

  const counts = useMemo(() => {
    const c: Record<LoanStatus, number> = { Active: 0, Overdue: 0, Returned: 0, Cancelled: 0, Lost: 0 };
    for (const l of loans) c[l.status]++;
    return c;
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const q = loanSearch.toLowerCase();
    return loans.filter((l) => {
      if (tab !== "Requests" && l.status !== tab) return false;
      if (!q) return true;
      return (
        l.member.toLowerCase().includes(q) ||
        l.memberId.toLowerCase().includes(q) ||
        l.book.toLowerCase().includes(q) ||
        l.bookId.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    });
  }, [loans, tab, loanSearch]);

  const fail = (description: string) => toast({ title: "Could not complete", description, variant: "destructive" });

  const handleIssue = async (input: IssueLoanInput, labels: { member: string; book: string }) => {
    const result = await issueLoan(input);
    if (result.success) {
      toast({
        title: `Book issued · ${result.data.id}`,
        description: `${labels.book} to ${labels.member}, due ${formatDhaka(result.data.due_date)}`,
      });
      setTab("Active");
    }
    return result;
  };

  const columns: Column<ActiveLoan>[] = [
    { key: "id", label: "Loan ID", className: "text-muted-foreground font-mono text-[12px]", mobile: "meta", render: (l) => l.id },
    {
      key: "member",
      label: "Member",
      mobile: "subtitle",
      render: (l) => (
        <>
          <span className="font-medium text-foreground">{l.member}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{l.memberId}</span>
        </>
      ),
    },
    {
      key: "book",
      label: "Book",
      className: "max-w-[240px]",
      mobile: "title",
      render: (l) => (
        <div className="min-w-0">
          <p className="text-foreground truncate">{l.book}</p>
          <p className="text-muted-foreground text-[11px] font-mono">{l.bookId}</p>
        </div>
      ),
    },
    { key: "issued", label: "Issued", className: "text-muted-foreground whitespace-nowrap", mobile: "meta", render: (l) => formatDhaka(l.issuedDate) },
    {
      key: "due",
      label: tab === "Returned" ? "Due / Returned" : "Due Date",
      className: "text-muted-foreground whitespace-nowrap",
      mobile: "meta",
      render: (l) => (
        <>
          {formatDhaka(l.dueDate)}
          {l.returnDate && <span className="block text-[11px]">returned {formatDhaka(l.returnDate)}</span>}
        </>
      ),
    },
    {
      key: "fine",
      label: "Fine",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap text-[12px]",
      mobile: "meta",
      render: (l) =>
        l.fineAmount > 0 ? (
          <span className={cn(l.fineIsAccruing ? "text-destructive" : "text-foreground")}>
            {formatTaka(l.fineAmount)}
            <span className="block text-[11px] text-muted-foreground">
              {l.fineIsAccruing ? `accruing · ${l.daysOverdue}d` : l.fineStatus}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      mobile: "badge",
      render: (l) => <StatusBadge variant={LOAN_STATUS_VARIANT[l.status]}>{l.status}</StatusBadge>,
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            mobile: "actions" as const,
            render: (l: ActiveLoan) => {
              const isOpen = l.status === "Active" || l.status === "Overdue";
              // void_loan also accepts Returned loans whose fine has no payments yet.
              const canVoid = isOpen || (l.status === "Returned" && !(l.fineStatus === "Paid" || l.fineStatus === "Partially Paid"));
              return (
                <RowActions
                  primary={[
                    ...(isOpen ? [{ label: "Return", icon: RotateCcw, onClick: () => setReturnTarget(l) }] : []),
                    { label: "View", icon: Eye, onClick: () => setDetailLoan(l) },
                  ]}
                  secondary={[
                    ...(isOpen
                      ? [
                          { label: "Extend Due Date", icon: CalendarPlus, onClick: () => setExtendTarget(l) },
                          { label: "Mark Lost", icon: SearchX, onClick: () => setLostTarget(l), variant: "destructive" as const },
                        ]
                      : []),
                    // update_loan_details refuses voided loans; everything else can have its guarantor/notes corrected.
                    ...(l.status !== "Cancelled"
                      ? [{ label: "Edit Details", icon: Pencil, onClick: () => setEditTarget(l) }]
                      : []),
                    ...(canVoid
                      ? [{ label: "Void Loan", icon: XCircle, onClick: () => setVoidTarget(l), variant: "destructive" as const }]
                      : []),
                  ]}
                />
              );
            },
          },
        ]
      : []),
  ];

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading loans…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageHeader
        title="Lending"
        subtitle={`${counts.Active + counts.Overdue} on loan · ${counts.Overdue} overdue · ${reqs.requests.length} web request${reqs.requests.length === 1 ? "" : "s"} waiting`}
      />

      {canWrite && <IssueBookForm settings={settings} onIssue={handleIssue} />}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="h-8">
            {LOAN_TABS.map((t) => (
              <TabsTrigger key={t} value={t} className="text-[12px] h-6 px-2.5">
                {t} <span className="ml-1 text-muted-foreground font-mono">{counts[t]}</span>
              </TabsTrigger>
            ))}
            <TabsTrigger value="Requests" className="text-[12px] h-6 px-2.5">
              Web Requests
              <span
                className={cn(
                  "ml-1 font-mono",
                  reqs.requests.length > 0 ? "rounded bg-primary text-primary-foreground px-1" : "text-muted-foreground",
                )}
              >
                {reqs.requests.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {tab !== "Requests" && (
          <SearchBar value={loanSearch} onChange={setLoanSearch} placeholder="Search loans..." className="w-56" />
        )}
      </div>

      {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

      {tab === "Requests" ? (
        <WebRequestsTable
          requests={reqs.requests}
          loading={reqs.loading}
          error={reqs.error}
          canWrite={canWrite}
          settings={settings}
          onRefresh={reqs.refetch}
          onIssue={async (r) => {
            const res = await reqs.issueFromRequest(r.id);
            if (res.success) {
              toast({
                title: `Issued · ${res.data.id}`,
                description: `${r.bookTitle} to ${r.memberName}, due ${formatDhaka(res.data.due_date)}`,
              });
            } else fail(res.error);
            return res;
          }}
          onReject={async (r, reason) => {
            const res = await reqs.rejectRequest(r.id, reason);
            if (res.success) toast({ title: "Request rejected", description: `${r.id} · copy released` });
            return res;
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLoans}
          keyExtractor={(l) => l.id}
          onRowClick={(l) => setDetailLoan(l)}
          emptyMessage={`No ${tab.toLowerCase()} loans.`}
          compact
        />
      )}

      <LoanDetailModal loan={detailLoan} open={!!detailLoan} onClose={() => setDetailLoan(null)} />

      <ExtendLoanDialog
        loan={extendTarget}
        today={today}
        onClose={() => setExtendTarget(null)}
        onExtend={async (loanId, newDate) => {
          const res = await extendLoan(loanId, newDate);
          if (!res.success) return res.error;
          toast({ title: "Loan extended", description: `${loanId} now due ${formatDhaka(res.data.due_date)}` });
          return null;
        }}
      />

      <EditLoanDetailsDialog
        loan={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={async (loanId, changes) => {
          const res = await updateLoanDetails(loanId, changes);
          if (!res.success) return res.error;
          toast({ title: "Loan details updated", description: loanId });
          return null;
        }}
      />

      <ReturnLoanDialog
        loan={returnTarget}
        today={today}
        onClose={() => setReturnTarget(null)}
        onReturn={async (loanId, date) => {
          const t = returnTarget;
          const res = await returnLoan(loanId, date);
          if (!res.success) return res.error;
          const fine = res.data.fine;
          toast({
            title: "Book returned",
            description: `${t?.book ?? loanId}${fine ? ` · Fine ${fine.id}: ${formatTaka(Number(fine.amount))}` : " · on time"}`,
          });
          return null;
        }}
      />

      <ReasonDialog
        open={!!voidTarget}
        title={`Void loan ${voidTarget?.id ?? ""}`}
        description={
          voidTarget
            ? `Use this for a loan recorded by mistake. "${voidTarget.book}" goes back on the shelf if still out, and any fine is voided.`
            : ""
        }
        label="Reason *"
        placeholder="e.g. Issued to the wrong member"
        confirmLabel="Void Loan"
        destructive
        onClose={() => setVoidTarget(null)}
        onConfirm={async (reason) => {
          if (!voidTarget) return "No loan selected";
          const res = await voidLoan(voidTarget.id, reason);
          if (!res.success) return res.error;
          toast({ title: "Loan voided", description: voidTarget.id });
          return null;
        }}
      />

      <ReasonDialog
        open={!!lostTarget}
        title={`Mark ${lostTarget?.id ?? ""} as lost`}
        description={
          lostTarget
            ? `"${lostTarget.book}" is removed from stock (total copies − 1) and ${lostTarget.member} is charged the book's price (or the default book value if it has none).`
            : ""
        }
        label="Note"
        placeholder="Optional"
        required={false}
        confirmLabel="Mark Lost"
        destructive
        onClose={() => setLostTarget(null)}
        onConfirm={async (note) => {
          if (!lostTarget) return "No loan selected";
          const res = await markLost(lostTarget.id, note);
          if (!res.success) return res.error;
          toast({ title: "Marked lost", description: `Fine ${res.data.fine.id}: ${formatTaka(Number(res.data.fine.amount))}` });
          return null;
        }}
      />
    </div>
  );
}

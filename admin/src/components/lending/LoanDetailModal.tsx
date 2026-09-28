import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";
import { maskNid, type ActiveLoan } from "@/hooks/use-loans";
import { LOAN_STATUS_VARIANT } from "./loan-status";

interface LoanDetailModalProps {
  loan: ActiveLoan | null;
  open: boolean;
  onClose: () => void;
}

export function LoanDetailModal({ loan, open, onClose }: LoanDetailModalProps) {
  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold">Loan Details — {loan.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge variant={LOAN_STATUS_VARIANT[loan.status]}>{loan.status}</StatusBadge>
          </div>

          <Section title="Member">
            <Row label="Name" value={loan.member} />
            <Row label="Member ID" value={loan.memberId} />
          </Section>

          <Section title="Book">
            <Row label="Title" value={loan.book} />
            <Row label="Book ID" value={loan.bookId} />
          </Section>

          <Section title="Dates">
            <Row label="Issued" value={formatDhaka(loan.issuedDate)} />
            <Row label="Due" value={formatDhaka(loan.dueDate)} />
            {loan.returnDate && <Row label="Returned" value={formatDhaka(loan.returnDate)} />}
            {loan.renewalCount > 0 && <Row label="Renewals" value={String(loan.renewalCount)} />}
            {loan.requestId && <Row label="Web request" value={loan.requestId} />}
          </Section>

          {loan.fineAmount > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-destructive/5 border border-destructive/20 rounded">
              <span className="text-destructive font-medium">
                {loan.fineIsAccruing
                  ? `Accruing fine · ${loan.daysOverdue} day${loan.daysOverdue === 1 ? "" : "s"} late`
                  : `Fine ${loan.fineId ?? ""} · ${loan.fineStatus ?? ""}`}
              </span>
              <span className="text-destructive font-semibold">
                {formatTaka(loan.fineAmount)}
                {!loan.fineIsAccruing && loan.fineBalance > 0 && loan.fineBalance !== loan.fineAmount && (
                  <span className="font-normal"> ({formatTaka(loan.fineBalance)} due)</span>
                )}
              </span>
            </div>
          )}

          <Section title="Guarantor">
            <Row label="Name" value={loan.guarantor.name} />
            <Row label="Phone" value={loan.guarantor.phone} />
            {loan.guarantor.email && <Row label="Email" value={loan.guarantor.email} />}
            <Row label="Relationship" value={loan.guarantor.relationship} />
            <Row label="NID" value={maskNid(loan.guarantor.nid)} />
            <Row
              label="Address"
              value={[loan.guarantor.street, loan.guarantor.city, loan.guarantor.district, loan.guarantor.postalCode].filter(Boolean).join(", ")}
            />
          </Section>

          {loan.notes && (
            <Section title="Notes">
              <p className="whitespace-pre-wrap text-foreground">{loan.notes}</p>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      <div className="bg-secondary/30 rounded p-2.5 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

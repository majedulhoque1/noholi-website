import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTaka } from "@/lib/currency";
import { formatDhaka } from "@/lib/dhaka-date";
import type { Fine } from "@/hooks/use-fines";
import { FINE_STATUS_VARIANT } from "./fine-status";

interface Props {
  fine: Fine | null;
  open: boolean;
  onClose: () => void;
}

export function FineDetailDrawer({ fine, open, onClose }: Props) {
  if (!fine) return null;

  const rows: [string, string][] = [
    [fine.isAccruing ? "Loan ID" : "Fine ID", fine.id],
    ...(!fine.isAccruing ? [["Loan ID", fine.loanId] as [string, string]] : []),
    ["Kind", fine.kind === "Lost" ? "Lost book" : "Overdue"],
    ["Member", fine.member],
    ["Member ID", fine.memberId],
    ["Book", fine.book],
    ["Book ID", fine.bookId || "—"],
    ["Due Date", formatDhaka(fine.dueDate)],
    ["Return Date", fine.returnDate ? formatDhaka(fine.returnDate) : "Not returned"],
    ["Days Overdue", String(fine.daysOverdue)],
    [fine.isAccruing ? "Accrued so far" : "Fine Amount", formatTaka(fine.amount)],
    ...(!fine.isAccruing
      ? ([
          ["Paid", formatTaka(fine.amountPaid)],
          ["Balance", formatTaka(fine.balance)],
          ["Created", formatDhaka(fine.createdDate)],
        ] as [string, string][])
      : []),
  ];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[360px] sm:w-[400px] flex flex-col overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-base">{fine.isAccruing ? `Accruing fine · ${fine.id}` : `Fine ${fine.id}`}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Status</span>
            <StatusBadge variant={FINE_STATUS_VARIANT[fine.status]}>{fine.status}</StatusBadge>
          </div>

          {fine.isAccruing && (
            <p className="text-[12px] text-muted-foreground bg-secondary/40 rounded p-2">
              This book is still out. The fine keeps growing each day until it is returned, then becomes payable.
            </p>
          )}

          <div className="space-y-2 text-[13px]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-border last:border-0 gap-3">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <span className="font-medium text-foreground text-right break-words">{value}</span>
              </div>
            ))}
          </div>

          {fine.payments.length > 0 && (
            <div className="space-y-2 text-[13px]">
              <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wide">
                Payments ({fine.payments.length})
              </h3>
              {fine.payments.map((p) => (
                <div key={p.id} className="rounded border border-border p-2 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{formatTaka(p.amount)}</span>
                    <span className="text-muted-foreground">{p.method}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDhaka(p.paidAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {p.reference && ` · Ref ${p.reference}`}
                  </p>
                  {p.note && <p className="text-[12px] text-foreground">{p.note}</p>}
                </div>
              ))}
            </div>
          )}

          {fine.waiver && (
            <div className="space-y-2 text-[13px]">
              <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wide">Waiver</h3>
              <div className="rounded border border-border p-2 space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">{formatTaka(fine.waiver.amountWaived)} waived</span>
                  <span className="text-muted-foreground">{formatDhaka(fine.waiver.waivedDate)}</span>
                </div>
                <p className="text-[12px] text-foreground">{fine.waiver.reason}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

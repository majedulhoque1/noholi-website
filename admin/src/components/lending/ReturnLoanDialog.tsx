import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";
import type { ActiveLoan } from "@/hooks/use-loans";

interface Props {
  loan: ActiveLoan | null;
  today: string;
  onClose: () => void;
  /** Return an error string to keep the dialog open. */
  onReturn: (loanId: string, returnDate: string) => Promise<string | null>;
}

/** Confirms a return. The date defaults to today (Dhaka) and may be backdated to the issue date. */
export function ReturnLoanDialog({ loan, today, onClose, onReturn }: Props) {
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loan) {
      setDate(today);
      setError(null);
    }
  }, [loan, today]);

  if (!loan) return null;

  const submit = async () => {
    setSaving(true);
    setError(null);
    const err = await onReturn(loan.id, date);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Dialog open={!!loan} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Return Book — {loan.id}</DialogTitle>
          <DialogDescription className="text-[13px]">
            &ldquo;{loan.book}&rdquo; from {loan.member}. Due {formatDhaka(loan.dueDate)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-[13px]">
          <div className="space-y-1">
            <label htmlFor="return-date" className="text-[12px] font-medium text-muted-foreground">Return date</label>
            <Input
              id="return-date"
              type="date"
              value={date}
              min={loan.issuedDate}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 text-base md:h-8 md:text-[13px]"
            />
          </div>
          {loan.status === "Overdue" && (
            <p className="text-[12px] text-destructive">
              Overdue by {loan.daysOverdue} day{loan.daysOverdue === 1 ? "" : "s"} today (accruing {formatTaka(loan.fineAmount)}).
              The fine is fixed from the return date.
            </p>
          )}
        </div>
        {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="text-[13px]">Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving || !date} className="text-[13px] gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDaysISO, formatDhaka } from "@/lib/dhaka-date";
import type { ActiveLoan } from "@/hooks/use-loans";

interface ExtendLoanDialogProps {
  loan: ActiveLoan | null;
  today: string;
  onClose: () => void;
  /** Return an error string to keep the dialog open. */
  onExtend: (loanId: string, newDueDate: string) => Promise<string | null>;
}

export function ExtendLoanDialog({ loan, today, onClose, onExtend }: ExtendLoanDialogProps) {
  const [newDate, setNewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewDate("");
    setError(null);
  }, [loan]);

  if (!loan) return null;

  // extend_loan: the new date must be after the current due date and not in the past.
  const base = loan.dueDate > today ? loan.dueDate : today;
  const minDate = loan.dueDate >= today ? addDaysISO(loan.dueDate, 1) : today;

  const handleExtend = async () => {
    if (!newDate) return;
    setSubmitting(true);
    setError(null);
    const err = await onExtend(loan.id, newDate);
    setSubmitting(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Dialog open={!!loan} onOpenChange={(v) => !v && !submitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Extend Loan — {loan.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-[13px]">
          <p className="text-muted-foreground">
            Current due date: <span className="text-foreground font-medium">{formatDhaka(loan.dueDate)}</span>
          </p>
          <div className="space-y-1">
            <label htmlFor="extend-date" className="text-[12px] font-medium text-muted-foreground">New Due Date</label>
            <Input
              id="extend-date"
              type="date"
              value={newDate}
              min={minDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-8 text-[13px]"
            />
          </div>
          <div className="flex gap-1">
            {[7, 14].map((d) => (
              <Button key={d} variant="outline" size="sm" className="h-7 text-[12px]" onClick={() => setNewDate(addDaysISO(base, d))}>
                +{d} days
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">An extension does not count as a renewal.</p>
        </div>
        {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-[13px]" disabled={submitting}>Cancel</Button>
          <Button size="sm" onClick={handleExtend} disabled={!newDate || submitting} className="text-[13px] gap-1.5">
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Extend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

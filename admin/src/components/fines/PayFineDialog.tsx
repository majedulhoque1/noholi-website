import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTaka } from "@/lib/currency";
import { PAYMENT_METHODS, type Fine, type PaymentMethod, type RecordPaymentInput } from "@/hooks/use-fines";
import type { Outcome } from "@/hooks/use-inventory";

interface Props {
  fine: Fine | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (payment: RecordPaymentInput) => Promise<Outcome<{ duplicate: boolean; status: string }>>;
}

export function PayFineDialog({ fine, open, onClose, onConfirm }: Props) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // One idempotency key per dialog open: a double click or a retry after a
  // network error re-sends the same key, so the payment is recorded once.
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    if (fine && open) {
      setAmount(fine.balance);
      setMethod("Cash");
      setReference("");
      setNote("");
      setError(null);
      setIdempotencyKey(crypto.randomUUID());
    }
    // Only when the dialog opens for a fine, not when the list refreshes underneath it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fine?.id, open]);

  if (!fine) return null;

  const invalid = !(amount > 0) || amount > fine.balance;

  const submit = async () => {
    if (saving) return;
    if (invalid) {
      setError(`Enter an amount between ${formatTaka(1)} and ${formatTaka(fine.balance)}`);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onConfirm({ amount, method, reference: reference.trim(), note: note.trim(), idempotencyKey });
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="md:max-w-md md:max-h-[85vh] md:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Record Payment</DialogTitle>
          <DialogDescription className="text-[13px]">
            {fine.id} · {fine.member} · fine {formatTaka(fine.amount)}
            {fine.amountPaid > 0 && <> · paid {formatTaka(fine.amountPaid)}</>} · <strong>due {formatTaka(fine.balance)}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <label htmlFor="fine-amount" className="text-[12px] font-medium text-muted-foreground">Amount Paid (৳) *</label>
            <Input
              id="fine-amount"
              type="number"
              min={1}
              max={fine.balance}
              step="any"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-11 text-base md:h-8 md:text-[13px]"
            />
            <p className="text-[11px] text-muted-foreground">
              Part payments are allowed; the fine stays Partially Paid until the balance is cleared.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Payment Method *</label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-11 text-base md:h-8 md:text-[12px]" aria-label="Payment method"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="fine-ref" className="text-[12px] font-medium text-muted-foreground">Reference / Receipt No.</label>
            <Input id="fine-ref" value={reference} onChange={(e) => setReference(e.target.value)} className="h-11 text-base md:h-8 md:text-[13px]" placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <label htmlFor="fine-note" className="text-[12px] font-medium text-muted-foreground">Note</label>
            <Input id="fine-note" value={note} onChange={(e) => setNote(e.target.value)} className="h-11 text-base md:h-8 md:text-[13px]" placeholder="Optional" />
          </div>

          {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px] h-11 md:h-8" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" className="text-[13px] h-11 md:h-8 gap-1.5" onClick={submit} disabled={saving || invalid}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

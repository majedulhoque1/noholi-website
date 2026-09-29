import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { maskNid, type ActiveLoan, type LoanDetailsChanges } from "@/hooks/use-loans";

interface EditLoanDetailsDialogProps {
  loan: ActiveLoan | null;
  onClose: () => void;
  /** Return an error string to keep the dialog open. */
  onSave: (loanId: string, changes: LoanDetailsChanges) => Promise<string | null>;
}

type Form = Record<keyof Omit<LoanDetailsChanges, "guarantor_nid">, string>;

const FIELDS: { key: keyof Form; label: string; wide?: boolean }[] = [
  { key: "guarantor_name", label: "Guarantor name" },
  { key: "guarantor_relationship", label: "Relationship" },
  { key: "guarantor_phone", label: "Phone" },
  { key: "guarantor_email", label: "Email" },
  { key: "guarantor_street", label: "Street / lane", wide: true },
  { key: "guarantor_city", label: "City / area" },
  { key: "guarantor_district", label: "District" },
  { key: "guarantor_postal_code", label: "Postal code" },
];

function formFor(loan: ActiveLoan): Form {
  const g = loan.guarantor;
  return {
    guarantor_name: g.name ?? "",
    guarantor_relationship: g.relationship ?? "",
    guarantor_phone: g.phone ?? "",
    guarantor_email: g.email ?? "",
    guarantor_street: g.street ?? "",
    guarantor_city: g.city ?? "",
    guarantor_district: g.district ?? "",
    guarantor_postal_code: g.postalCode ?? "",
    notes: loan.notes ?? "",
  };
}

/**
 * Corrects a loan's guarantor snapshot or notes (update_loan_details).
 * Dates, book and member are never editable here — use Extend / Void for those.
 */
export function EditLoanDetailsDialog({ loan, onClose, onSave }: EditLoanDetailsDialogProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [nid, setNid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(loan ? formFor(loan) : null);
    setNid("");
    setError(null);
  }, [loan]);

  if (!loan || !form) return null;

  const handleSave = async () => {
    const original = formFor(loan);
    const changes: LoanDetailsChanges = {};
    for (const k of Object.keys(form) as (keyof Form)[]) {
      if (form[k].trim() !== original[k].trim()) changes[k] = form[k];
    }
    // The full NID is never loaded into the list; only send it when staff typed a new one.
    if (nid.trim()) changes.guarantor_nid = nid.trim();
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    const err = await onSave(loan.id, changes);
    setSubmitting(false);
    if (err) setError(err);
    else onClose();
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <Dialog open={!!loan} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="md:max-w-lg md:max-h-[85vh] md:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold">Edit loan details — {loan.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-[13px]">
          <p className="text-muted-foreground">
            {loan.book} · {loan.member} ({loan.memberId})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FIELDS.map((f) => (
              <label key={f.key} className={f.wide ? "sm:col-span-2 space-y-1" : "space-y-1"}>
                <span className="text-[12px] font-medium text-muted-foreground">{f.label}</span>
                <Input value={form[f.key]} onChange={set(f.key)} className="h-11 text-base md:h-8 md:text-[13px]" />
              </label>
            ))}
            <label className="sm:col-span-2 space-y-1">
              <span className="text-[12px] font-medium text-muted-foreground">
                Guarantor NID — currently {maskNid(loan.guarantor.nid)}
              </span>
              <Input
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                placeholder="Leave blank to keep the current NID"
                className="h-11 text-base md:h-8 md:text-[13px]"
              />
            </label>
            <label className="sm:col-span-2 space-y-1">
              <span className="text-[12px] font-medium text-muted-foreground">Notes</span>
              <Textarea value={form.notes} onChange={set("notes")} rows={3} className="text-base md:text-[13px]" />
            </label>
          </div>
          {error && <p className="text-destructive text-[12px]">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={submitting}>
            {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description: string;
  label: string;
  placeholder?: string;
  confirmLabel: string;
  /** When false the text is optional (e.g. a note on Mark lost). */
  required?: boolean;
  destructive?: boolean;
  onClose: () => void;
  /** Return an error string to keep the dialog open and show it. */
  onConfirm: (text: string) => Promise<string | null>;
}

/** Small confirm dialog that collects a reason / note (void, mark lost, reject request). */
export function ReasonDialog({
  open, title, description, label, placeholder, confirmLabel, required = true, destructive, onClose, onConfirm,
}: ReasonDialogProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    if (required && !text.trim()) {
      setError(`${label.replace(" *", "")} is required.`);
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onConfirm(text.trim());
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{title}</DialogTitle>
          <DialogDescription className="text-[13px]">{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <label htmlFor="reason-text" className="text-[12px] font-medium text-muted-foreground">{label}</label>
          <Textarea
            id="reason-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="text-base min-h-[72px] md:text-[13px]"
          />
        </div>
        {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="text-[13px] h-11 md:h-9">Cancel</Button>
          <Button
            size="sm"
            onClick={submit}
            disabled={saving || (required && !text.trim())}
            className={
              destructive
                ? "text-[13px] h-11 md:h-9 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "text-[13px] h-11 md:h-9 gap-1.5"
            }
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { emptyMemberInput, type MemberInput } from "@/hooks/use-members";
import { MemberFormFields, isMemberInputValid } from "@/components/members/MemberFormFields";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  /** Resolves on success; throws with a readable message on failure (dialog stays open). */
  onAdd: (member: MemberInput) => Promise<void>;
}

export function AddMemberDialog({ open, onClose, onAdd }: AddMemberDialogProps) {
  const [form, setForm] = useState<MemberInput>(emptyMemberInput());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const close = () => { setError(""); onClose(); };

  const handleSubmit = async () => {
    if (!isMemberInputValid(form)) return;
    setSaving(true);
    setError("");
    try {
      await onAdd(form);
      setForm(emptyMemberInput());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && close()}>
      <DialogContent className="md:max-w-lg md:max-h-[88vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">Add New Member</DialogTitle>
          <DialogDescription className="text-[13px]">The MEM-#### ID is assigned automatically. Create their website login afterwards from the member's actions.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1 mt-1">
          <MemberFormFields value={form} onChange={setForm} showStatus={false} />
        </div>
        {error && <p className="text-[12px] text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px] h-11 md:h-8" onClick={close} disabled={saving}>Cancel</Button>
          <Button size="sm" className="text-[13px] h-11 md:h-8" onClick={handleSubmit} disabled={!isMemberInputValid(form) || saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

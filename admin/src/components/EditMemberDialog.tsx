import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { emptyMemberInput, memberToInput, type Member, type MemberInput } from "@/hooks/use-members";
import { MemberFormFields, isMemberInputValid } from "@/components/members/MemberFormFields";

interface EditMemberDialogProps {
  open: boolean;
  onClose: () => void;
  /** Resolves on success; throws with a readable message on failure (dialog stays open). */
  onSave: (updates: MemberInput) => Promise<void>;
  member: Member | null;
}

export function EditMemberDialog({ open, onClose, onSave, member }: EditMemberDialogProps) {
  const [form, setForm] = useState<MemberInput>(emptyMemberInput());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) { setForm(memberToInput(member)); setError(""); }
  }, [member]);

  const handleSubmit = async () => {
    if (!isMemberInputValid(form)) return;
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="md:max-w-lg md:max-h-[88vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Member</DialogTitle>
          <DialogDescription className="text-[13px]">
            Update member information below. ID: {member?.memberId}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1 mt-1">
          <MemberFormFields value={form} onChange={setForm} />
        </div>
        {error && <p className="text-[12px] text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px] h-11 md:h-8" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" className="text-[13px] h-11 md:h-8" onClick={handleSubmit} disabled={!isMemberInputValid(form) || saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Check, Copy, KeyRound, TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface TempPasswordInfo {
  /** Who the login belongs to, e.g. "Rahim Uddin (MEM-0012)". */
  title: string;
  /** What they type in the sign-in box: MEM-#### for members, the email for staff. */
  loginId: string;
  loginLabel?: string;
  password: string;
  /** Extra line under the warning, e.g. where to sign in. */
  note?: string;
}

function CopyField({ label, value, testId }: { label: string; value: string; testId?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1">
      <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code data-testid={testId} className="flex-1 rounded border border-border bg-secondary px-3 py-2 font-mono text-[15px] tracking-wide text-foreground select-all">
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1 text-[12px]"
          onClick={() => {
            navigator.clipboard?.writeText(value).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

/** Shows a one-time temporary password. The backend never stores it in plain text. */
export function TempPasswordDialog({ info, onClose }: { info: TempPasswordInfo | null; onClose: () => void }) {
  return (
    <Dialog open={!!info} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" /> Temporary password</DialogTitle>
          <DialogDescription className="text-[13px]">{info?.title}</DialogDescription>
        </DialogHeader>
        {info && (
          <div className="space-y-3">
            <CopyField label={info.loginLabel ?? "Sign-in ID"} value={info.loginId} />
            <CopyField label="Temporary password" value={info.password} testId="temp-password" />
            <div className="flex gap-2 rounded border border-warning/30 bg-warning/10 p-2.5 text-[12px] text-foreground">
              <TriangleAlert className="h-4 w-4 shrink-0 text-warning mt-0.5" />
              <div className="space-y-1">
                <p><strong>This password will not be shown again.</strong> Give it to them by phone now.</p>
                <p className="text-muted-foreground">They must choose a new password the first time they sign in.{info.note ? ` ${info.note}` : ""}</p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button size="sm" onClick={onClose}>Done, I've passed it on</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

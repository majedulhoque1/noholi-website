import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MfaSetup } from "./MfaSetup";

/** Shown to admin accounts whose session hasn't passed TOTP yet (aal1). Opens the MFA step once per sign-in. */
export function MfaBanner() {
  const { needsMfa, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [autoOpenedFor, setAutoOpenedFor] = useState<string | null>(null);

  useEffect(() => {
    if (needsMfa && user && autoOpenedFor !== user.id) {
      setOpen(true);
      setAutoOpenedFor(user.id);
    }
    if (!needsMfa) setOpen(false);
  }, [needsMfa, user, autoOpenedFor]);

  if (!needsMfa) return null;

  return (
    <>
      <div role="status" className="flex items-center gap-3 border-b border-warning/30 bg-warning/10 px-4 py-2 text-[13px] text-foreground">
        <ShieldAlert className="h-4 w-4 shrink-0 text-warning" />
        <span className="flex-1">
          You're signed in as an administrator. Admin tools (policy, staff, fine waivers) stay locked until you verify with your authenticator app.
        </span>
        <Button size="sm" className="h-7 text-[12px]" onClick={() => setOpen(true)}>Verify now</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Two-factor sign-in</DialogTitle>
            <DialogDescription className="text-[13px]">Administrators confirm each sign-in with a code from an authenticator app.</DialogDescription>
          </DialogHeader>
          <MfaSetup onVerified={() => setTimeout(() => setOpen(false), 900)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

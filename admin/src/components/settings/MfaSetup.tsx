import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode =
  | { kind: "loading" }
  | { kind: "enroll"; factorId: string; qr: string; secret: string }
  | { kind: "challenge"; factorId: string }
  | { kind: "done" }
  | { kind: "error"; message: string };

/**
 * TOTP two-factor step for admins: enrols an authenticator app the first time,
 * otherwise asks for the current 6-digit code. On success the session becomes aal2
 * and `refreshRole()` unlocks the admin-only parts of the OS.
 */
export function MfaSetup({ onVerified }: { onVerified?: () => void }) {
  const { refreshRole } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    setError("");
    const { data, error: listErr } = await supabase.auth.mfa.listFactors();
    if (listErr) { setMode({ kind: "error", message: listErr.message }); return; }
    const verified = data.totp.find((f) => f.status === "verified");
    if (verified) { setMode({ kind: "challenge", factorId: verified.id }); return; }
    // Remove half-finished enrolments (they block a new one with the same name).
    for (const f of data.all.filter((x) => x.factor_type === "totp" && x.status !== "verified")) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data: en, error: enErr } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Noholi OS" });
    if (enErr || !en) { setMode({ kind: "error", message: enErr?.message ?? "Could not start setup." }); return; }
    setMode({ kind: "enroll", factorId: en.id, qr: en.totp.qr_code, secret: en.totp.secret });
  }, []);

  useEffect(() => { start(); }, [start]);

  const verify = async () => {
    if (mode.kind !== "enroll" && mode.kind !== "challenge") return;
    setBusy(true);
    setError("");
    const { error: vErr } = await supabase.auth.mfa.challengeAndVerify({ factorId: mode.factorId, code: code.trim() });
    if (vErr) {
      setError(vErr.message === "Invalid TOTP code entered" ? "That code is not right. Check the time on your phone and try the newest code." : vErr.message);
      setBusy(false);
      return;
    }
    await refreshRole();
    toast({ title: "Two-factor verified", description: "Admin tools are unlocked for this session." });
    setBusy(false);
    setMode({ kind: "done" });
    onVerified?.();
  };

  if (mode.kind === "loading") {
    return <div className="flex items-center gap-2 py-6 text-[13px] text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking two-factor sign-in…</div>;
  }
  if (mode.kind === "error") {
    return (
      <div className="space-y-2">
        <p className="text-[13px] text-destructive">{mode.message}</p>
        <Button size="sm" variant="outline" onClick={start}>Try again</Button>
      </div>
    );
  }
  if (mode.kind === "done") {
    return <p className="flex items-center gap-2 text-[13px] text-success"><ShieldCheck className="h-4 w-4" /> Verified. Admin tools are unlocked for this session.</p>;
  }

  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); verify(); }}>
      {mode.kind === "enroll" ? (
        <div className="space-y-2">
          <p className="text-[13px] text-foreground">
            1. Open an authenticator app (Google Authenticator, Microsoft Authenticator, 2FAS…) and scan this code.
          </p>
          <div className="flex items-start gap-4">
            <img src={mode.qr} alt="QR code for your authenticator app" className="h-40 w-40 rounded border border-border bg-white p-1" />
            <div className="space-y-1 min-w-0">
              <p className="text-[12px] text-muted-foreground">Can't scan? Enter this key by hand:</p>
              <code data-testid="totp-secret" className="block break-all rounded bg-secondary px-2 py-1 font-mono text-[12px] text-foreground select-all">{mode.secret}</code>
            </div>
          </div>
          <p className="text-[13px] text-foreground">2. Type the 6-digit code the app shows.</p>
        </div>
      ) : (
        <p className="text-[13px] text-foreground">Enter the 6-digit code from your authenticator app.</p>
      )}
      <div className="flex items-center gap-2">
        <Input
          aria-label="Authenticator code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="h-9 w-32 font-mono text-[15px] tracking-widest"
          autoFocus
        />
        <Button type="submit" size="sm" className="h-9" disabled={busy || code.length !== 6}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Verify
        </Button>
      </div>
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </form>
  );
}

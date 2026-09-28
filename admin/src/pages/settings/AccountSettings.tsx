import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MfaSetup } from "@/components/settings/MfaSetup";
import { formatDhaka } from "@/lib/dhaka-date";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-[13px] border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right">{children}</span>
    </div>
  );
}

const getPasswordStrength = (pw: string): { label: string; color: string } => {
  if (pw.length < 8) return { label: "Too short (min 8)", color: "text-destructive" };
  const score = [/[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score >= 3 && pw.length >= 10) return { label: "Strong", color: "text-success" };
  if (score >= 2) return { label: "Good", color: "text-primary" };
  return { label: "Fair", color: "text-warning" };
};

export function AccountSettings() {
  const { toast } = useToast();
  const { user, role, isAdmin, needsMfa } = useAuth();
  const [hasFactor, setHasFactor] = useState<boolean | null>(null);
  const [showMfa, setShowMfa] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      setHasFactor(!!data?.all.some((f) => f.factor_type === "totp" && f.status === "verified"));
    });
  }, [isAdmin]);

  const handleChangePassword = async () => {
    setPwError("");
    if (newPw.length < 8) { setPwError("The new password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("The two passwords don't match."); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) { setPwError(error.message); return; }
    setNewPw("");
    setConfirmPw("");
    toast({ title: "Password changed", description: "Use the new password next time you sign in." });
  };

  const pwStrength = newPw ? getPasswordStrength(newPw) : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your account</CardTitle>
          <CardDescription className="text-xs">Staff accounts are created by an administrator. Ask one to change your email or role.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border px-3">
            <Row label="Email">{user?.email ?? "—"}</Row>
            <Row label="Role">{role === "admin" ? "Administrator" : "Staff"}</Row>
            <Row label="Last sign-in">{user?.last_sign_in_at ? formatDhaka(user.last_sign_in_at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</Row>
            <Row label="Idle sign-out">After 30 minutes without activity</Row>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {isAdmin ? <ShieldCheck className="h-4 w-4 text-success" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
            Two-factor sign-in (authenticator app)
          </CardTitle>
          <CardDescription className="text-xs">Required for administrators before policy, staff and fine-waiver actions work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border px-3">
            <Row label="Authenticator app">{hasFactor == null ? "…" : hasFactor ? "Set up" : "Not set up"}</Row>
            <Row label="This session">{isAdmin ? "Verified" : needsMfa ? "Not verified yet" : role === "admin" ? "—" : "Not needed for staff"}</Row>
          </div>
          {needsMfa && !showMfa && <Button size="sm" onClick={() => setShowMfa(true)}>{hasFactor ? "Verify now" : "Set up authenticator"}</Button>}
          {needsMfa && showMfa && <MfaSetup onVerified={() => setHasFactor(true)} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription className="text-xs">At least 8 characters.{role === "admin" && hasFactor ? " Administrators must be two-factor verified to change it." : ""}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="max-w-sm space-y-3" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
            <input type="text" autoComplete="username" value={user?.email ?? ""} readOnly hidden />
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs">New password</Label>
              <Input id="new-pw" type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-8 text-sm" />
              {pwStrength && <p className={`text-[11px] ${pwStrength.color}`}>Strength: {pwStrength.label}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-xs">Confirm new password</Label>
              <Input id="confirm-pw" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-8 text-sm" />
            </div>
            {pwError && <p className="text-[12px] text-destructive">{pwError}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPw || !newPw || !confirmPw} size="sm">
                {savingPw && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

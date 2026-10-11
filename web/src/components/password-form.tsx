import { useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { describeError, supabase } from "@/lib/supabase";

// Change-password form shared by /account/password and Settings > Security.
// Ported from web-legacy/src/pages/ChangePassword.jsx: confirm the current password first
// (updateUser alone would accept any signed-in session), then auth.updateUser({ password }),
// then rpc('complete_password_change'), then refresh the member row. Success is reported only
// after every step has succeeded.

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  disabled: boolean;
}) {
  const { t } = useApp();
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className="h-11 pr-11"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? t("auth.pw.hide") : t("auth.pw.show")}
          aria-controls={id}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PasswordForm({
  forced = false,
  onDone,
  showRequirements = true,
}: {
  /** True when the member signed in with a temporary password (the first field is then "Temporary password"). */
  forced?: boolean;
  /** Called after the password change fully succeeded and the member row was refreshed. */
  onDone: () => void;
  showRequirements?: boolean;
}) {
  const { t } = useApp();
  const { memberId, refreshMember } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // True once auth.updateUser succeeded but complete_password_change did not: a retry must only
  // finish the second step (the old password no longer works).
  const passwordSaved = useRef(false);

  const validate = (): string => {
    if (!current) return t("auth.pw.errEnterCurrent");
    if (!next) return t("auth.pw.errEnterNew");
    if (next.length < 8) return t("auth.pw.errMin");
    if (!/[0-9!@#$%]/.test(next)) return t("auth.pw.errNumeral");
    if (next === current) return t("auth.pw.errDiffer");
    if (next !== confirm) return t("auth.pw.errMismatch");
    return "";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!passwordSaved.current) {
      const problem = validate();
      if (problem) {
        setErr(problem);
        return;
      }
    }
    setBusy(true);
    setErr("");
    try {
      if (!passwordSaved.current) {
        if (!memberId) throw new Error(t("supabaseLib.genericError"));
        // Confirm the current password.
        const { data: email, error: rErr } = await supabase.rpc("resolve_login", {
          identifier: memberId,
        });
        if (rErr || !email) throw rErr ?? new Error(t("supabaseLib.genericError"));
        const { error: sErr } = await supabase.auth.signInWithPassword({
          email: email as string,
          password: current,
        });
        if (sErr) {
          // Wrong password is a credentials error; anything else (offline, server) is shown as it is.
          const wrong = /invalid login credentials/i.test(sErr.message || "");
          throw wrong ? new Error(t("auth.pw.currentWrong")) : sErr;
        }
        const { error: uErr } = await supabase.auth.updateUser({ password: next });
        if (uErr) throw uErr;
        passwordSaved.current = true;
      }
      const { error: cErr } = await supabase.rpc("complete_password_change");
      if (cErr) throw cErr;
      passwordSaved.current = false;
      setCurrent("");
      setNext("");
      setConfirm("");
      await refreshMember();
      onDone();
    } catch (error) {
      const message = describeError(error);
      setErr(passwordSaved.current ? `${message} ${t("auth.pw.finishPending")}` : message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <PasswordField
        id="pw-current"
        label={forced ? t("auth.pw.temporaryLabel") : t("auth.pw.currentLabel")}
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
        disabled={busy || passwordSaved.current}
      />
      <PasswordField
        id="pw-new"
        label={t("auth.pw.newLabel")}
        value={next}
        onChange={setNext}
        autoComplete="new-password"
        disabled={busy || passwordSaved.current}
      />
      <PasswordField
        id="pw-confirm"
        label={t("auth.pw.confirmLabel")}
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
        disabled={busy || passwordSaved.current}
      />
      {showRequirements && (
        <div className="border border-border p-4 text-sm">
          <div className="eyebrow mb-2">{t("auth.pw.requirements")}</div>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>{t("auth.pw.req1")}</li>
            <li>{t("auth.pw.req2")}</li>
            <li>{t("auth.pw.req3")}</li>
          </ul>
        </div>
      )}
      {err && (
        <p className="text-sm text-destructive" role="alert">
          {err}
        </p>
      )}
      <Button type="submit" disabled={busy} aria-busy={busy} className="w-fit">
        {busy ? t("auth.pw.updating") : t("auth.pw.update")}
      </Button>
    </form>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { callRpc, describeError } from "@/lib/rpc";
import { formatDhaka } from "@/lib/dhaka-date";

/** Postgres DOW: 0 = Sunday … 6 = Saturday. */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type NumKey =
  | "loan_days" | "max_items" | "fine_per_day" | "default_book_value" | "hold_grace_days"
  | "pickup_window_days" | "renewals_allowed" | "renewal_days";

const FIELDS: { key: NumKey; label: string; help: string; unit?: string; step?: string }[] = [
  { key: "loan_days", label: "Loan length", unit: "days", help: "Default due date when a book is issued." },
  { key: "max_items", label: "Items per member", unit: "items", help: "Active loans + web holds a member may have at once." },
  { key: "fine_per_day", label: "Late fine", unit: "৳ / day", step: "0.5", help: "Charged from the first day late. No grace period." },
  { key: "default_book_value", label: "Default book value", unit: "৳", help: "Fine cap and lost-book charge when a book has no price." },
  { key: "hold_grace_days", label: "Hold grace", unit: "days", help: "A web hold expires this many days after the pickup date." },
  { key: "pickup_window_days", label: "Pickup window", unit: "days", help: "Members may pick a pickup date from today up to this many days ahead." },
  { key: "renewals_allowed", label: "Self-renewals", unit: "per loan", help: "How many times a member can renew a loan on the website." },
  { key: "renewal_days", label: "Renewal length", unit: "days", help: "Days one renewal adds to the due date." },
];

type Settings = Record<NumKey, number> & { closed_weekdays: number[]; timezone: string; updated_at: string | null };

export function PolicySettings() {
  const { toast } = useToast();
  const { isAdmin, needsMfa } = useAuth();
  const [saved, setSaved] = useState<Settings | null>(null);
  const [form, setForm] = useState<Record<NumKey, string>>({} as Record<NumKey, string>);
  const [closed, setClosed] = useState<number[]>([]);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (error) { setLoadError(describeError(error).message); return; }
    const s = data as unknown as Settings;
    setSaved(s);
    setForm(Object.fromEntries(FIELDS.map((f) => [f.key, String(s[f.key] ?? "")])) as Record<NumKey, string>);
    setClosed([...(s.closed_weekdays ?? [])].sort());
  }, []);

  useEffect(() => { load(); }, [load]);

  const readOnly = !isAdmin;
  const changed = saved
    ? FIELDS.filter((f) => Number(form[f.key]) !== Number(saved[f.key]))
    : [];
  const closedChanged = saved ? JSON.stringify([...closed].sort()) !== JSON.stringify([...(saved.closed_weekdays ?? [])].sort()) : false;
  const invalid = FIELDS.some((f) => form[f.key] === "" || Number.isNaN(Number(form[f.key])));

  const handleSave = async () => {
    if (!saved) return;
    const args: Record<string, unknown> = {};
    for (const f of changed) args[`p_${f.key}`] = Number(form[f.key]);
    if (closedChanged) args.p_closed_weekdays = [...closed].sort();
    setSaving(true);
    const r = await callRpc("update_settings", args);
    setSaving(false);
    if (r.success === false) {
      toast({ title: "Policy not saved", description: r.error, variant: "destructive" });
      return;
    }
    toast({ title: "Policy saved", description: "New values apply to every loan, request and fine from now on." });
    await load();
  };

  if (loadError) return <p className="text-[13px] text-destructive">{loadError}</p>;
  if (!saved) return <div className="flex items-center gap-2 text-[13px] text-muted-foreground py-6"><Loader2 className="h-4 w-4 animate-spin" /> Loading policy…</div>;

  return (
    <div className="space-y-4">
      {readOnly && (
        <div className="flex items-start gap-2 rounded border border-border bg-secondary/60 p-3 text-[12px] text-muted-foreground">
          <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            {needsMfa
              ? "Read-only until you verify two-factor sign-in (see the banner at the top)."
              : "Read-only. Only an administrator (with two-factor sign-in) can change the library policy."}
          </span>
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lending policy</CardTitle>
          <CardDescription className="text-xs">
            These numbers are enforced by the database for staff and the website alike.
            {saved.updated_at && ` Last changed ${formatDhaka(saved.updated_at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={`policy-${f.key}`} className="text-xs">{f.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`policy-${f.key}`}
                    type="number"
                    min={0}
                    step={f.step ?? "1"}
                    value={form[f.key] ?? ""}
                    disabled={readOnly}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="h-8 text-sm w-28"
                  />
                  {f.unit && <span className="text-[12px] text-muted-foreground">{f.unit}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{f.help}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Opening days</CardTitle>
          <CardDescription className="text-xs">
            Tick the days the library is closed. Pickup dates can't fall on them, and due dates move to the next open day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {WEEKDAYS.map((d, i) => (
              <label key={d} className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox
                  aria-label={`Closed on ${d}`}
                  checked={closed.includes(i)}
                  disabled={readOnly}
                  onCheckedChange={(v) => setClosed((p) => (v === true ? [...p, i] : p.filter((x) => x !== i)))}
                />
                {d}
              </label>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground">
            Timezone: <span className="font-medium text-foreground">Asia/Dhaka</span> (fixed). Every "today", due date and overdue check uses Dhaka time.
          </p>
        </CardContent>
      </Card>

      {!readOnly && (
        <div className="flex justify-end items-center gap-3">
          {(changed.length > 0 || closedChanged) && (
            <span className="text-[12px] text-muted-foreground">{changed.length + (closedChanged ? 1 : 0)} unsaved change(s)</span>
          )}
          <Button onClick={handleSave} disabled={saving || invalid || (changed.length === 0 && !closedChanged)} size="sm">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Save policy
          </Button>
        </div>
      )}
    </div>
  );
}

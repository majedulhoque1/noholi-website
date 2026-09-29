import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TempPasswordDialog, type TempPasswordInfo } from "@/components/members/TempPasswordDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { invokeEdge } from "@/hooks/use-members";
import { callRpc } from "@/lib/rpc";
import { formatDhaka } from "@/lib/dhaka-date";

interface StaffRow {
  user_id: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
  last_sign_in_at: string | null;
  mfa_enabled: boolean;
}

const when = (iso: string | null) => (iso ? formatDhaka(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never");

export function StaffSettings() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [staff, setStaff] = useState<StaffRow[] | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<StaffRow | null>(null);
  const [temp, setTemp] = useState<TempPasswordInfo | null>(null);

  const load = useCallback(async () => {
    const r = await callRpc<StaffRow[]>("list_staff");
    if (r.success === false) { setError(r.error); return; }
    setStaff(r.data ?? []);
    setError("");
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setAdding(true);
    const r = await invokeEdge<{ user_id: string; email: string; role: string; temp_password: string }>(
      "create-staff-login", { email: email.trim(), role },
    );
    setAdding(false);
    if (r.success === false) { toast({ title: "Could not add staff", description: r.error, variant: "destructive" }); return; }
    setEmail("");
    await load();
    setTemp({
      title: `${r.data.email} · ${r.data.role === "admin" ? "Administrator" : "Staff"}`,
      loginId: r.data.email,
      loginLabel: "Email (they sign in to Noholi OS with this)",
      password: r.data.temp_password,
    });
  };

  const handleRemove = async () => {
    const s = removing;
    setRemoving(null);
    if (!s) return;
    const r = await callRpc("remove_staff", { p_user_id: s.user_id });
    if (r.success === false) { toast({ title: "Could not remove staff", description: r.error, variant: "destructive" }); return; }
    toast({ title: "Staff access removed", description: s.email });
    await load();
  };

  const columns: Column<StaffRow>[] = [
    { key: "email", label: "Email", className: "font-medium text-foreground", mobile: "title", render: (s) => <>{s.email}{s.user_id === user?.id && <span className="text-muted-foreground font-normal"> (you)</span>}</> },
    { key: "role", label: "Role", mobile: "badge", render: (s) => <StatusBadge variant={s.role === "admin" ? "accent" : "default"}>{s.role === "admin" ? "Administrator" : "Staff"}</StatusBadge> },
    { key: "last", label: "Last sign-in", className: "text-[12px] text-muted-foreground whitespace-nowrap", mobile: "meta", render: (s) => when(s.last_sign_in_at) },
    { key: "created", label: "Added", className: "text-[12px] text-muted-foreground whitespace-nowrap", mobile: "meta", render: (s) => formatDhaka(s.created_at) },
    ...(isAdmin ? [{
      key: "actions", label: "", headerClassName: "text-right", className: "text-right",
      mobile: "actions" as const,
      render: (s: StaffRow) => s.user_id === user?.id ? null : (
        <Button size="sm" variant="ghost" className="h-7 text-[12px] gap-1 text-destructive" onClick={() => setRemoving(s)}>
          <UserMinus className="h-3.5 w-3.5" /> Remove
        </Button>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Staff accounts</CardTitle>
          <CardDescription className="text-xs">People who can sign in to Noholi OS. Members never can.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          {!staff && !error ? (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : (
            <DataTable columns={columns} data={staff ?? []} keyExtractor={(s) => s.user_id} compact emptyMessage="No staff accounts." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Add staff</CardTitle>
          <CardDescription className="text-xs">Creates the login and shows a one-time temporary password.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdmin ? (
            <p className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Only an administrator can add or remove staff.
            </p>
          ) : (
            <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <div className="space-y-1.5 w-full sm:w-auto">
                <Label htmlFor="staff-email" className="text-xs">Email</Label>
                <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 text-base w-full sm:w-64 md:h-8 md:text-sm" placeholder="name@example.com" />
              </div>
              <div className="space-y-1.5 w-full sm:w-auto">
                <Label className="text-xs">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "staff" | "admin")}>
                  <SelectTrigger className="h-11 text-base w-full sm:w-40 md:h-8 md:text-sm" aria-label="Role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="sm" className="h-11 w-full sm:w-auto md:h-8" disabled={adding || !/^\S+@\S+\.\S+$/.test(email.trim())}>
                {adding && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Create staff login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove staff access"
        description={`${removing?.email ?? ""} will no longer be able to use Noholi OS. Their past actions stay in the activity log.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemove}
      />
      <TempPasswordDialog info={temp} onClose={() => setTemp(null)} />
    </div>
  );
}

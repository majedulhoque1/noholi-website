import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { callRpc, describeError } from "@/lib/rpc";
import { formatDhaka } from "@/lib/dhaka-date";

interface AuditRow {
  id: number;
  actor: string | null;
  actor_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  at: string;
}

const PAGE = 50;
const when = (iso: string) => formatDhaka(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Read-only view of `audit_log`: every staff RPC and direct staff edit writes a row. */
export function SecuritySettings() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    callRpc<{ user_id: string; email: string }[]>("list_staff").then((r) => {
      if (r.success) setEmails(Object.fromEntries((r.data ?? []).map((s) => [s.user_id, s.email])));
    });
  }, []);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (offset: number) => {
    setLoading(true);
    let q = supabase.from("audit_log").select("id, actor, actor_role, action, entity, entity_id, at").order("at", { ascending: false });
    if (term) {
      const safe = term.replace(/[%,()*\\]/g, " ");
      q = q.or(`action.ilike.%${safe}%,entity.ilike.%${safe}%,entity_id.ilike.%${safe}%,actor_role.ilike.%${safe}%`);
    }
    const { data, error: err } = await q.range(offset, offset + PAGE);
    setLoading(false);
    if (err) { setError(describeError(err).message); return; }
    const page = (data ?? []) as AuditRow[];
    // Member actors: show their MEM id instead of a bare uuid.
    const memberActors = [...new Set(page.filter((r) => r.actor && r.actor_role === "member").map((r) => r.actor as string))];
    if (memberActors.length) {
      const { data: ms } = await supabase.from("members").select("id, auth_user_id").in("auth_user_id", memberActors);
      if (ms?.length) setEmails((prev) => ({ ...prev, ...Object.fromEntries(ms.map((m) => [m.auth_user_id as string, m.id])) }));
    }
    setMore(page.length > PAGE);
    const slice = page.slice(0, PAGE);
    setRows((prev) => (offset === 0 ? slice : [...prev, ...slice]));
    setError("");
  }, [term]);

  useEffect(() => { load(0); }, [load]);

  const columns: Column<AuditRow>[] = [
    { key: "at", label: "Time (Dhaka)", className: "text-[12px] text-muted-foreground whitespace-nowrap", mobile: "meta", render: (r) => when(r.at) },
    {
      key: "actor", label: "Actor",
      mobile: "subtitle",
      render: (r) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{r.actor ? emails[r.actor] ?? `${r.actor.slice(0, 8)}…` : "System"}</span>
          {r.actor_role && <StatusBadge variant={r.actor_role === "admin" ? "accent" : r.actor_role === "member" ? "muted" : "default"}>{r.actor_role}</StatusBadge>}
        </div>
      ),
    },
    { key: "action", label: "Action", className: "font-mono text-[12px] text-foreground", mobile: "title", render: (r) => r.action },
    { key: "entity", label: "Entity", className: "text-[12px]", mobile: "meta", render: (r) => <><span className="text-muted-foreground">{r.entity}</span>{r.entity_id && <span className="font-mono text-foreground"> {r.entity_id}</span>}</> },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Activity log</CardTitle>
          <CardDescription className="text-xs">
            Every staff action (loans, returns, payments, member and book edits, settings) is recorded by the database. Read-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Search action, table, ID or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 text-base max-w-xs md:h-8 md:text-sm"
            aria-label="Search activity"
          />
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <DataTable columns={columns} data={rows} compact keyExtractor={(r) => String(r.id)} emptyMessage={loading ? "Loading…" : "No activity found."} />
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">{rows.length} entr{rows.length === 1 ? "y" : "ies"} shown</span>
            {more && (
              <Button size="sm" variant="outline" className="h-7 text-[12px]" disabled={loading} onClick={() => load(rows.length)}>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Load more
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">You are signed out automatically after 30 minutes without activity.</p>
        </CardContent>
      </Card>
    </div>
  );
}

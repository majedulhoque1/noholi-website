import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { callRpc, describeError } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";
import { useCanWrite } from "@/lib/roles";
import { formatDhaka } from "@/lib/dhaka-date";

type Kind = "Recommendations" | "Writing" | "Reviews";
const KINDS: Kind[] = ["Recommendations", "Writing", "Reviews"];

interface Row {
  id: string;
  kind: Kind;
  memberId: string;
  memberName: string;
  title: string;
  by: string;
  status: string;
  createdAt: string;
  body: string;
  fields: [string, string][];
  note: string;
  rating?: number;
}

const REC_STATUSES = ["Under Review", "Considering", "Acquired", "Not Planned"];
const CON_STATUSES = ["Approved", "Published", "Needs Revision", "Rejected"];
const VARIANT: Record<string, BadgeVariant> = {
  Submitted: "accent",
  "Pending Review": "accent",
  "Under Review": "default",
  Considering: "default",
  Acquired: "success",
  Approved: "success",
  Published: "success",
  "Not Planned": "muted",
  "Needs Revision": "warning",
  Rejected: "destructive",
  Draft: "muted",
};

// The generated types predate these tables (migration 20261014000100); query them loosely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (t: string) => any };

const when = (iso: string) => formatDhaka(iso, { day: "numeric", month: "short", year: "numeric" });

export default function SubmissionsPage() {
  const canWrite = useCanWrite();
  const { toast } = useToast();
  const [kind, setKind] = useState<Kind>("Recommendations");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const [rec, con] = await Promise.all([
      db
        .from("book_recommendations")
        .select("*, members(name)")
        .order("created_at", { ascending: false })
        .limit(500),
      db
        .from("member_contributions")
        .select("*, members(name)")
        .neq("status", "Draft")
        .order("submitted_at", { ascending: false })
        .limit(500),
    ]);
    const err = rec.error ?? con.error;
    if (err) {
      setError(describeError(err).message);
      return;
    }
    setError(null);
    const out: Row[] = [];
    for (const r of (rec.data ?? []) as Record<string, any>[]) {
      out.push({
        id: r.id, kind: "Recommendations", memberId: r.member_id, memberName: r.members?.name ?? r.member_id,
        title: r.title, by: r.author, status: r.status, createdAt: r.created_at, body: r.reason,
        note: r.explanation ?? "",
        fields: ([
          ["Format", r.format], ["Language", r.language], ["Publisher", r.publisher], ["ISBN", r.isbn],
          ["Year", r.year], ["Genre", r.genre], ["Narrator", r.narrator], ["Source", r.source], ["Notes", r.notes],
        ] as [string, string | null][]).filter(([, v]) => v) as [string, string][],
      });
    }
    for (const r of (con.data ?? []) as Record<string, any>[]) {
      out.push({
        id: r.id, kind: r.kind === "review" ? "Reviews" : "Writing", memberId: r.member_id,
        memberName: r.members?.name ?? r.member_id, title: r.title,
        by: r.book_title ? `On: ${r.book_title}` : (r.kind === "blog" ? "Blog" : "Creative writing"),
        status: r.status, createdAt: r.submitted_at ?? r.created_at, body: r.content ?? "", note: r.note ?? "",
        rating: r.rating ?? undefined,
        fields: ([
          ["Language", r.language], ["Category", r.category], ["Tags", (r.tags ?? []).join(", ")],
          ["Book id", r.book_id], ["Excerpt", r.excerpt],
        ] as [string, string | null][]).filter(([, v]) => v) as [string, string][],
      });
    }
    setRows(out);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const open = rows.find((r) => r.id === openId) ?? null;
  const visible = rows.filter((r) => r.kind === kind);
  const waiting = (k: Kind) =>
    rows.filter((r) => r.kind === k && (r.status === "Submitted" || r.status === "Pending Review")).length;

  const openRow = (r: Row) => {
    setOpenId(r.id);
    setNote(r.note);
    const choices = r.kind === "Recommendations" ? REC_STATUSES : CON_STATUSES;
    setStatus(choices.includes(r.status) ? r.status : choices[0]!);
  };

  const save = async () => {
    if (!open || busy) return;
    setBusy(true);
    const res =
      open.kind === "Recommendations"
        ? await callRpc("review_recommendation", { p_id: open.id, p_status: status, p_explanation: note || null })
        : await callRpc("review_contribution", { p_id: open.id, p_status: status, p_note: note || null });
    setBusy(false);
    if (res.success === false) {
      toast({ title: "Could not save decision", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Decision saved", description: `${open.id} is now "${status}".` });
    setOpenId(null);
    await reload();
  };

  const columns: Column<Row>[] = [
    {
      key: "title", label: "Title", mobile: "title",
      render: (r) => (
        <div className="min-w-0">
          <p className="text-foreground truncate">{r.title}</p>
          <p className="text-[12px] text-muted-foreground truncate">{r.by}</p>
        </div>
      ),
    },
    { key: "member", label: "Member", mobile: "subtitle", render: (r) => `${r.memberName} · ${r.memberId}` },
    { key: "when", label: "Sent", mobile: "meta", className: "text-[12px] text-muted-foreground whitespace-nowrap", render: (r) => when(r.createdAt) },
    { key: "status", label: "Status", mobile: "badge", render: (r) => <StatusBadge variant={VARIANT[r.status] ?? "default"}>{r.status}</StatusBadge> },
  ];

  const choices = open?.kind === "Recommendations" ? REC_STATUSES : CON_STATUSES;
  const needsNote =
    status === "Not Planned" || status === "Needs Revision" || status === "Rejected";

  return (
    <div className="space-y-3">
      <PageHeader
        title="Member submissions"
        subtitle={`${waiting("Recommendations")} recommendations · ${waiting("Writing")} pieces · ${waiting("Reviews")} reviews waiting`}
      />
      <FilterChips options={KINDS} value={kind} onChange={(v) => setKind(v as Kind)} />
      {error && <p className="text-[12px] text-destructive">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-[13px]">Loading submissions…</span>
        </div>
      ) : (
        <DataTable columns={columns} data={visible} keyExtractor={(r) => r.id} onRowClick={openRow} emptyMessage="Nothing here yet." compact />
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full md:max-w-lg p-0 flex flex-col">
          {open && (
            <>
              <SheetHeader className="p-4 border-b border-border space-y-1 text-left">
                <SheetTitle className="text-base">{open.title}</SheetTitle>
                <SheetDescription className="text-[12px]">
                  {open.id} · {open.memberName} ({open.memberId}) · {when(open.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {open.rating ? <p className="text-[13px]">Rating: {open.rating} / 5</p> : null}
                <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-y-1 text-[13px]">
                  {open.fields.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
                {open.body && (
                  <div>
                    <p className="text-[12px] text-muted-foreground mb-1">
                      {open.kind === "Recommendations" ? "Why the member suggests it" : "Content"}
                    </p>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed">{open.body}</p>
                  </div>
                )}
              </div>
              {canWrite && (
                <div className="border-t border-border p-4 space-y-2">
                  <label className="text-[12px] text-muted-foreground" htmlFor="sub-status">Decision</label>
                  <select
                    id="sub-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px]"
                  >
                    {choices.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <label className="text-[12px] text-muted-foreground" htmlFor="sub-note">
                    Message to the member{needsNote ? " (required)" : " (optional)"}
                  </label>
                  <Textarea id="sub-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                  <Button onClick={save} disabled={busy || (needsNote && !note.trim())} className="w-full">
                    {busy ? "Saving…" : "Save decision"}
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useEffect, useState } from "react";
import { BookCheck, XCircle, Loader2, RefreshCw } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { RowActions } from "@/components/RowActions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { addDaysISO, formatDhaka } from "@/lib/dhaka-date";
import { maskNid, type BorrowRequest, type LibrarySettings } from "@/hooks/use-loans";
import type { Outcome } from "@/hooks/use-inventory";
import { ReasonDialog } from "./ReasonDialog";

interface Props {
  requests: BorrowRequest[];
  loading: boolean;
  error: string | null;
  canWrite: boolean;
  settings: LibrarySettings;
  onRefresh: () => void;
  onIssue: (req: BorrowRequest) => Promise<Outcome<{ id: string; due_date: string }>>;
  onReject: (req: BorrowRequest, reason: string) => Promise<Outcome<unknown>>;
}

/** Milliseconds until the hold lapses: the end of `expires_at` (its last valid day) in Dhaka. */
function msLeft(expiresAt: string, now: number) {
  return new Date(`${addDaysISO(expiresAt, 1)}T00:00:00+06:00`).getTime() - now;
}

function Countdown({ expiresAt, now }: { expiresAt: string; now: number }) {
  const ms = msLeft(expiresAt, now);
  if (ms <= 0) return <StatusBadge variant="destructive">Expired</StatusBadge>;
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const label = days > 0 ? `${days}d ${hours % 24}h left` : `${hours}h ${Math.floor((ms % 3_600_000) / 60_000)}m left`;
  return <StatusBadge variant={hours < 24 ? "warning" : "default"}>{label}</StatusBadge>;
}

export function WebRequestsTable({ requests, loading, error, canWrite, settings, onRefresh, onIssue, onReject }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [issueTarget, setIssueTarget] = useState<BorrowRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const columns: Column<BorrowRequest>[] = [
    { key: "id", label: "Request", className: "text-muted-foreground font-mono text-[12px]", render: (r) => r.id },
    {
      key: "member",
      label: "Member",
      render: (r) => (
        <div>
          <span className="font-medium text-foreground">{r.memberName}</span>
          <span className="text-muted-foreground ml-1.5 text-[11px]">{r.memberId}</span>
          <p className="text-[11px] text-muted-foreground">NID {maskNid(r.memberNid)}</p>
        </div>
      ),
    },
    {
      key: "book",
      label: "Book",
      className: "max-w-[220px]",
      render: (r) => (
        <div className="min-w-0">
          <p className="text-foreground truncate">{r.bookTitle}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{r.bookId}</p>
        </div>
      ),
    },
    { key: "pickup", label: "Pickup", className: "text-muted-foreground whitespace-nowrap", render: (r) => formatDhaka(r.pickupDate) },
    {
      key: "expires",
      label: "Hold until",
      className: "whitespace-nowrap",
      render: (r) => (
        <div className="space-y-0.5">
          <p className="text-muted-foreground">{formatDhaka(r.expiresAt)}</p>
          <Countdown expiresAt={r.expiresAt} now={now} />
        </div>
      ),
    },
    {
      key: "guarantor",
      label: "Guarantor",
      render: (r) => (
        <div className="text-[12px]">
          <p className="text-foreground">
            {r.guarantor.name || "—"}
            {r.guarantor.relationship && <span className="text-muted-foreground"> · {r.guarantor.relationship}</span>}
          </p>
          <p className="text-muted-foreground">
            {r.guarantor.phone || "—"} · NID {maskNid(r.guarantor.nid)}
          </p>
          {!r.guarantorConsent && <p className="text-destructive text-[11px]">No consent recorded</p>}
        </div>
      ),
    },
    {
      key: "note",
      label: "Note",
      className: "text-muted-foreground text-[12px] max-w-[160px] truncate",
      render: (r) => r.note || "—",
    },
    ...(canWrite
      ? [
          {
            key: "actions" as const,
            label: "",
            headerClassName: "text-right",
            className: "text-right",
            render: (r: BorrowRequest) => (
              <RowActions
                primary={[
                  { label: "Issue", icon: BookCheck, onClick: () => setIssueTarget(r), disabled: msLeft(r.expiresAt, now) <= 0 },
                  { label: "Reject", icon: XCircle, onClick: () => setRejectTarget(r), variant: "destructive" as const },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          Holds placed on the website. Each keeps one copy reserved until the pickup date plus {settings.holdGraceDays} days,
          then expires automatically. Refreshes every minute.
        </p>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[12px]" onClick={onRefresh}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
        </Button>
      </div>
      {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}
      <DataTable
        columns={columns}
        data={requests}
        keyExtractor={(r) => r.id}
        emptyMessage={loading ? "Loading…" : "No web requests waiting."}
        compact
      />

      <ConfirmDialog
        open={!!issueTarget}
        onOpenChange={(v) => !v && setIssueTarget(null)}
        title="Issue from web request"
        description={
          issueTarget
            ? `Issue "${issueTarget.bookTitle}" to ${issueTarget.memberName} (${issueTarget.id})? The reserved copy becomes a loan due ${formatDhaka(addDaysISO(settings.today, settings.loanDays))}, with the guarantor from the request.`
            : ""
        }
        confirmLabel="Issue"
        onConfirm={async () => {
          if (!issueTarget) return;
          const t = issueTarget;
          setIssueTarget(null);
          await onIssue(t);
        }}
      />

      <ReasonDialog
        open={!!rejectTarget}
        title={`Reject ${rejectTarget?.id ?? ""}`}
        description={rejectTarget ? `"${rejectTarget.bookTitle}" for ${rejectTarget.memberName}. The member sees this reason, and the reserved copy is released.` : ""}
        label="Reason *"
        placeholder="e.g. The copy is damaged and being repaired"
        confirmLabel="Reject Request"
        destructive
        onClose={() => setRejectTarget(null)}
        onConfirm={async (reason) => {
          if (!rejectTarget) return "No request selected";
          const res = await onReject(rejectTarget, reason);
          return res.success ? null : res.error;
        }}
      />
    </div>
  );
}

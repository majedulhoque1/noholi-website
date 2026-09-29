import { useState } from "react";
import { Check, Loader2, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { FilterChips } from "@/components/FilterChips";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { ContactInfo } from "@/components/ContactInfo";
import { useToast } from "@/hooks/use-toast";
import { formatDhaka } from "@/lib/dhaka-date";
import { createMemberLogin } from "@/hooks/use-members";
import type { TempPasswordInfo } from "./TempPasswordDialog";
import type { Application, ApplicationStatus } from "./use-applications";
import type { useApplications } from "./use-applications";

const STATUS_VARIANT: Record<ApplicationStatus, BadgeVariant> = { Pending: "warning", Approved: "success", Rejected: "destructive" };
const FILTERS = ["Pending", "Approved", "Rejected", "All"] as const;
type Filter = typeof FILTERS[number];

interface Props {
  apps: ReturnType<typeof useApplications>;
  canWrite: boolean;
  /** Called after approval created a member (to refresh the member list). */
  onMemberCreated: () => void;
  onTempPassword: (info: TempPasswordInfo) => void;
}

export function ApplicationsPanel({ apps, canWrite, onMemberCreated, onTempPassword }: Props) {
  const { toast } = useToast();
  const { applications, loading, error, setContacted, approve, reject } = apps;
  const [filter, setFilter] = useState<Filter>("Pending");
  const [photo, setPhoto] = useState<Application | null>(null);
  const [approving, setApproving] = useState<Application | null>(null);
  const [rejecting, setRejecting] = useState<Application | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = filter === "All" ? applications : applications.filter((a) => a.status === filter);

  const fail = (title: string, description: string) => toast({ title, description, variant: "destructive" });

  const handleApprove = async () => {
    const app = approving;
    if (!app) return;
    setBusy(true);
    try {
      const r = await approve(app.id);
      if (r.success === false) { fail("Could not approve", r.error); return; }
      const memberId = r.data;
      onMemberCreated();
      const login = await createMemberLogin(memberId);
      if (login.success === false) {
        fail(`${app.name} is now ${memberId}, but the login was not created`, `${login.error} Use "Create login" on the member instead.`);
        return;
      }
      onTempPassword({
        title: `${app.name} (${memberId}) — application ${app.id} approved`,
        loginId: memberId,
        loginLabel: "Member ID (they sign in with this)",
        password: login.data.temp_password,
        note: "They sign in on the library website with their member ID.",
      });
    } finally {
      setBusy(false);
      setApproving(null);
    }
  };

  const handleReject = async () => {
    const app = rejecting;
    if (!app || !reason.trim()) return;
    setBusy(true);
    try {
      const r = await reject(app.id, reason);
      if (r.success === false) { fail("Could not reject", r.error); return; }
      toast({ title: "Application rejected", description: `${app.id} · ${app.name}` });
      setRejecting(null);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Application>[] = [
    {
      key: "photo", label: "", className: "w-12",
      mobile: "hidden",
      render: (a) => (
        <button
          type="button"
          onClick={() => a.photoUrl && setPhoto(a)}
          className="h-10 w-10 rounded bg-secondary flex items-center justify-center overflow-hidden shrink-0"
          aria-label={a.photoUrl ? `Photo of ${a.name}` : "No photo"}
        >
          {a.photoUrl ? <img src={a.photoUrl} alt="" className="h-10 w-10 object-cover" loading="lazy" /> : <User className="h-4 w-4 text-muted-foreground/50" />}
        </button>
      ),
    },
    { key: "id", label: "ID", className: "text-muted-foreground font-mono text-[12px]", mobile: "meta", render: (a) => a.id },
    {
      key: "name", label: "Applicant",
      mobile: "title",
      render: (a) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{a.name}</p>
          <p className="text-[12px] text-muted-foreground"><a href={`tel:${a.phone}`} className="hover:underline">{a.phone}</a></p>
        </div>
      ),
    },
    { key: "contact", label: "Contact", mobile: "subtitle", render: (a) => <ContactInfo email={a.email || undefined} phone={a.phone} /> },
    {
      key: "address", label: "Address",
      mobile: "meta",
      render: (a) => {
        const addr = [a.street, a.city, a.district, a.postalCode].filter(Boolean).join(", ");
        return addr ? <span className="text-[12px] text-muted-foreground">{addr}</span> : <span className="text-muted-foreground/50">—</span>;
      },
    },
    { key: "created", label: "Applied", className: "text-muted-foreground text-[12px] whitespace-nowrap", mobile: "meta", render: (a) => formatDhaka(a.createdAt) },
    {
      key: "contacted", label: "Contacted",
      mobile: "meta",
      render: (a) => (
        <Checkbox
          aria-label={`Contacted ${a.name}`}
          checked={a.contacted}
          disabled={!canWrite}
          onCheckedChange={async (v) => {
            const r = await setContacted(a.id, v === true);
            if (r.success === false) fail("Could not update", r.error);
          }}
        />
      ),
    },
    {
      key: "status", label: "Status",
      mobile: "badge",
      render: (a) => (
        <div className="space-y-0.5">
          <StatusBadge variant={STATUS_VARIANT[a.status]}>{a.status}</StatusBadge>
          {a.memberId && <p className="text-[11px] font-mono text-muted-foreground">{a.memberId}</p>}
          {a.status === "Rejected" && a.rejectionReason && <p className="text-[11px] text-muted-foreground max-w-[180px] truncate" title={a.rejectionReason}>{a.rejectionReason}</p>}
        </div>
      ),
    },
    ...(canWrite ? [{
      key: "actions", label: "", headerClassName: "text-right", className: "text-right whitespace-nowrap",
      mobile: "actions" as const,
      render: (a: Application) => a.status !== "Pending" ? null : (
        <div className="flex justify-end gap-1">
          <Button size="sm" className="h-7 text-[12px] gap-1" onClick={() => setApproving(a)}><Check className="h-3 w-3" /> Approve</Button>
          <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1 text-destructive" onClick={() => { setReason(""); setRejecting(a); }}><XCircle className="h-3 w-3" /> Reject</Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <FilterChips options={[...FILTERS]} value={filter} onChange={(v) => setFilter(v as Filter)} />
        <p className="text-[12px] text-muted-foreground">Phone the applicant first, tick "Contacted", then approve or reject.</p>
      </div>
      {error && <p className="text-[12px] text-destructive">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-[13px]">Loading applications…</span></div>
      ) : (
        <DataTable columns={columns} data={rows} keyExtractor={(a) => a.id} emptyMessage={filter === "Pending" ? "No pending applications." : "No applications."} compact />
      )}

      <Dialog open={!!photo} onOpenChange={(o) => !o && setPhoto(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{photo?.name}</DialogTitle>
            <DialogDescription className="font-mono text-[12px]">{photo?.id}</DialogDescription>
          </DialogHeader>
          {photo?.photoUrl && <img src={photo.photoUrl} alt={`Photo of ${photo.name}`} className="w-full rounded border border-border" />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!approving} onOpenChange={(o) => !o && !busy && setApproving(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Approve application</DialogTitle>
            <DialogDescription className="text-[13px]">
              {approving?.name} ({approving?.id}) becomes an Active member, and a website login with a one-time temporary password is created.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setApproving(null)} disabled={busy}>Cancel</Button>
            <Button size="sm" onClick={handleApprove} disabled={busy}>{busy && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Approve & create login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && !busy && setRejecting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Reject application</DialogTitle>
            <DialogDescription className="text-[13px]">{rejecting?.id} · {rejecting?.name}. Rejected applications and their photos are deleted after 90 days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-[12px] font-medium text-muted-foreground">Reason *</label>
            <Textarea aria-label="Rejection reason" className="text-base md:text-[13px]" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejecting(null)} disabled={busy}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleReject} disabled={busy || !reason.trim()}>{busy && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, History, Archive, ArchiveRestore, User, UserX, UserCheck, Loader2, KeyRound } from "lucide-react";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { MemberViewDrawer } from "@/components/MemberViewDrawer";
import { ApplicationsPanel } from "@/components/members/ApplicationsPanel";
import { TempPasswordDialog, type TempPasswordInfo } from "@/components/members/TempPasswordDialog";
import { useApplications } from "@/components/members/use-applications";
import { formatTaka } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { ContactInfo } from "@/components/ContactInfo";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCanWrite, useCanDelete } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useMembers, MERIT_GRADES, maskNid, createMemberLogin, resetMemberLogin, type Member,
} from "@/hooks/use-members";

const STATUS_VARIANT: Record<Member["status"], BadgeVariant> = {
  Active: "success",
  Suspended: "destructive",
  Expired: "warning",
};

const STATUS_OPTIONS = ["All", "Active", "Suspended", "Expired", "Archived"] as const;
const MERIT_OPTIONS = ["All Merit", ...MERIT_GRADES] as string[];

type ConfirmKind = "suspend" | "reactivate" | "delete" | "archive" | "restore" | "create-login" | "reset-login";

const CONFIRM_COPY: Record<ConfirmKind, { title: string; label: string; body: (n: string) => string; destructive?: boolean }> = {
  suspend: { title: "Suspend Member", label: "Suspend", destructive: true, body: (n) => `Suspend ${n}? They can't borrow or request books while suspended.` },
  reactivate: { title: "Reactivate Member", label: "Reactivate", body: (n) => `Reactivate ${n}? They will regain borrowing privileges.` },
  delete: { title: "Delete Member", label: "Delete", destructive: true, body: (n) => `Permanently delete ${n}? Only possible for a member with no loans, requests, fines, application or login. Otherwise archive them.` },
  archive: { title: "Archive Member", label: "Archive", body: (n) => `Archive ${n}? They disappear from the member list and can't sign in to the website. History is kept and you can restore them later.` },
  restore: { title: "Restore Member", label: "Restore", body: (n) => `Restore ${n} to the member list?` },
  "create-login": { title: "Create website login", label: "Create login", body: (n) => `Create a website login for ${n}? A one-time temporary password will be shown for you to give them by phone.` },
  "reset-login": { title: "Reset website login", label: "Reset password", destructive: true, body: (n) => `Reset ${n}'s password? Their current password stops working immediately and a new temporary password is shown once.` },
};

export default function MembersPage() {
  const canWrite = useCanWrite();
  const canDelete = useCanDelete();
  const { toast } = useToast();
  const {
    members, archivedMembers, loading, error, reload,
    addMember, updateStatus, updateMember, deleteMember, archiveMember, restoreMember,
  } = useMembers();
  const apps = useApplications();
  const [params, setParams] = useSearchParams();
  const view = params.get("tab") === "applications" ? "applications" : "members";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [meritFilter, setMeritFilter] = useState<string>("All Merit");
  const [viewMemberId, setViewMemberId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"profile" | "history">("profile");
  const [showAddMember, setShowAddMember] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [tempPassword, setTempPassword] = useState<TempPasswordInfo | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ member: Member; action: ConfirmKind } | null>(null);

  const pendingApps = apps.applications.filter((a) => a.status === "Pending").length;
  const everyone = [...members, ...archivedMembers];
  const hasFilters = search || statusFilter !== "All" || meritFilter !== "All Merit";
  const viewMember = everyone.find((m) => m.memberId === viewMemberId) ?? null;
  const openView = (m: Member, tab: "profile" | "history") => { setViewTab(tab); setViewMemberId(m.memberId); };
  const setView = (v: "members" | "applications") => setParams(v === "applications" ? { tab: "applications" } : {}, { replace: true });
  const fail = (title: string, e: unknown) =>
    toast({ title, description: e instanceof Error ? e.message : String(e), variant: "destructive" });

  const runLogin = async (m: Member, reset: boolean) => {
    const r = reset ? await resetMemberLogin(m.memberId) : await createMemberLogin(m.memberId);
    if (r.success === false) { fail(reset ? "Could not reset login" : "Could not create login", r.error); return; }
    await reload();
    setTempPassword({
      title: `${m.name} (${m.memberId})`,
      loginId: m.memberId,
      loginLabel: "Member ID (they sign in with this)",
      password: r.data.temp_password,
      note: "They sign in on the library website with their member ID.",
    });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { member: m, action } = confirmAction;
    setConfirmAction(null);
    try {
      if (action === "suspend") {
        await updateStatus(m.memberId, "Suspended");
        toast({ title: "Member suspended", description: `${m.name} is now Suspended` });
      } else if (action === "reactivate") {
        await updateStatus(m.memberId, "Active");
        toast({ title: "Member reactivated", description: `${m.name} is now Active` });
      } else if (action === "delete") {
        await deleteMember(m.memberId);
        toast({ title: "Member deleted", description: `${m.name} has been removed` });
      } else if (action === "archive") {
        await archiveMember(m.memberId);
        toast({ title: "Member archived", description: `${m.name} has been archived` });
      } else if (action === "restore") {
        await restoreMember(m.memberId);
        toast({ title: "Member restored", description: `${m.name} is back in the member list` });
      } else if (action === "create-login" || action === "reset-login") {
        await runLogin(m, action === "reset-login");
      }
    } catch (e) {
      fail(`Could not ${CONFIRM_COPY[action].label.toLowerCase()}`, e);
    }
  };

  const source = statusFilter === "Archived" ? archivedMembers : members;
  const q = search.toLowerCase();
  const filtered = source.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(search) ||
      (q.length >= 4 && m.nid.toLowerCase().endsWith(q));
    const matchesStatus = statusFilter === "All" || statusFilter === "Archived" || m.status === statusFilter;
    const matchesMerit = meritFilter === "All Merit" || m.meritGrade === meritFilter;
    return matchesSearch && matchesStatus && matchesMerit;
  });

  const columns: Column<Member>[] = [
    {
      key: "avatar",
      label: "",
      className: "w-10",
      render: (m) => (
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
          {m.avatar ? (
            <img src={m.avatar} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
          ) : (
            <User className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
        </div>
      ),
    },
    { key: "memberId", label: "ID", className: "text-muted-foreground font-mono text-[12px]", render: (m) => m.memberId },
    { key: "name", label: "Name", className: "font-medium text-foreground", render: (m) => m.name },
    { key: "nid", label: "NID", className: "text-muted-foreground font-mono text-[12px] whitespace-nowrap", render: (m) => maskNid(m.nid) || "—" },
    {
      key: "contact",
      label: "Contact",
      render: (m) => <ContactInfo email={m.email || undefined} phone={m.phone || undefined} />,
    },
    {
      key: "activeLoans",
      label: "Loans",
      render: (m) => (
        <span className="whitespace-nowrap">
          {m.activeLoans}
          {m.overdueLoans > 0 && <span className="text-destructive text-[11px] ml-1">({m.overdueLoans} late)</span>}
        </span>
      ),
    },
    { key: "holds", label: "Holds", render: (m) => m.activeHolds || "—" },
    {
      key: "fines",
      label: "Fines (৳)",
      render: (m) => (m.fines > 0 ? <span className="text-destructive">{formatTaka(m.fines)}</span>
        : m.accruingFines > 0 ? <span className="text-warning" title="Running late fee on an overdue loan">{formatTaka(m.accruingFines)}*</span> : "—"),
    },
    {
      key: "merit",
      label: "Merit",
      render: (m) => (
        <div className="min-w-0">
          <StatusBadge variant={m.meritGrade === "Not Assigned" ? "muted" : "default"}>{m.meritGrade}</StatusBadge>
          {m.meritNote && <p className="text-[11px] text-muted-foreground max-w-[160px] truncate mt-0.5" title={m.meritNote}>{m.meritNote}</p>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (m) => (
        <div className="flex flex-col items-start gap-0.5">
          {m.archivedAt ? <StatusBadge variant="muted">Archived</StatusBadge> : <StatusBadge variant={STATUS_VARIANT[m.status]}>{m.status}</StatusBadge>}
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{m.hasLogin ? (m.mustChangePassword ? "Login · temp pw" : "Login") : "No login"}</span>
        </div>
      ),
    },
    {
      key: "actions" as const,
      label: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (m: Member) => (
        <RowActions
          primary={[
            { label: "View", icon: Eye, onClick: () => openView(m, "profile") },
            { label: "History", icon: History, onClick: () => openView(m, "history") },
            ...(canWrite ? [{ label: "Edit", icon: Pencil, onClick: () => setEditMember(m) }] : []),
          ]}
          secondary={!canWrite ? [] : m.archivedAt ? [
            { label: "Restore", icon: ArchiveRestore, onClick: () => setConfirmAction({ member: m, action: "restore" }) },
          ] : [
            m.hasLogin
              ? { label: "Reset login", icon: KeyRound, onClick: () => setConfirmAction({ member: m, action: "reset-login" }) }
              : { label: "Create login", icon: KeyRound, onClick: () => setConfirmAction({ member: m, action: "create-login" }) },
            ...(m.status === "Active"
              ? [{ label: "Suspend", icon: UserX, onClick: () => setConfirmAction({ member: m, action: "suspend" }), variant: "destructive" as const }]
              : [{ label: "Reactivate", icon: UserCheck, onClick: () => setConfirmAction({ member: m, action: "reactivate" }) }]),
            { label: "Archive", icon: Archive, onClick: () => setConfirmAction({ member: m, action: "archive" }) },
            ...(canDelete
              ? [{ label: "Delete", icon: Trash2, onClick: () => setConfirmAction({ member: m, action: "delete" }), variant: "destructive" as const }]
              : []),
          ]}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading members…</span>
      </div>
    );
  }

  const copy = confirmAction ? CONFIRM_COPY[confirmAction.action] : null;

  return (
    <div className="space-y-3">
      <PageHeader
        title="Members"
        subtitle={`${members.length} registered members · ${pendingApps} pending application${pendingApps === 1 ? "" : "s"}`}
        actions={
          canWrite && view === "members" ? (
            <Button size="sm" className="gap-1.5 text-[13px] h-8" onClick={() => setShowAddMember(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Member
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-1 border-b border-border">
        {(["members", "applications"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-2 text-[13px] -mb-px border-b-2 transition-colors flex items-center gap-1.5",
              view === v ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "members" ? "Members" : "Applications"}
            {v === "applications" && pendingApps > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{pendingApps}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-[12px] text-destructive">{error}</p>}

      {view === "applications" ? (
        <ApplicationsPanel apps={apps} canWrite={canWrite} onMemberCreated={() => { reload(); }} onTempPassword={setTempPassword} />
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search name, ID, email, phone, NID last 4…"
              className="flex-1 min-w-[200px] max-w-xs"
            />
            <FilterChips
              options={[...STATUS_OPTIONS]}
              value={statusFilter as typeof STATUS_OPTIONS[number]}
              onChange={setStatusFilter}
            />
            <FilterChips options={MERIT_OPTIONS} value={meritFilter} onChange={setMeritFilter} />
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("All"); setMeritFilter("All Merit"); }}
                className="text-[12px] text-muted-foreground hover:text-foreground underline"
              >
                Reset
              </button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(m) => m.memberId}
            emptyMessage={statusFilter === "Archived" ? "No archived members." : "No members found."}
            compact
          />
        </>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={copy?.title ?? ""}
        description={copy && confirmAction ? copy.body(`${confirmAction.member.name} (${confirmAction.member.memberId})`) : ""}
        confirmLabel={copy?.label}
        variant={copy?.destructive ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />

      <AddMemberDialog
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={async (member) => {
          const id = await addMember(member);
          toast({ title: "Member added", description: `${member.name} (${id}). Use "Create login" to give them website access.` });
        }}
      />

      <MemberViewDrawer
        member={viewMember}
        tab={viewTab}
        onTabChange={setViewTab}
        onClose={() => setViewMemberId(null)}
        onEdit={(m) => setEditMember(m)}
        onLogin={(m) => setConfirmAction({ member: m, action: m.hasLogin ? "reset-login" : "create-login" })}
        canWrite={canWrite}
      />

      <EditMemberDialog
        open={!!editMember}
        onClose={() => setEditMember(null)}
        member={editMember}
        onSave={async (updates) => {
          if (!editMember) return;
          await updateMember(editMember.memberId, updates);
          toast({ title: "Member updated", description: `${updates.name} has been updated` });
        }}
      />

      <TempPasswordDialog info={tempPassword} onClose={() => setTempPassword(null)} />
    </div>
  );
}

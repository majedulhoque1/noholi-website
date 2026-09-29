import { User, Pencil, History, Phone, Mail, KeyRound, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeVariant } from "@/components/StatusBadge";
import { formatTaka } from "@/lib/currency";
import { formatDhaka } from "@/lib/dhaka-date";
import type { Member } from "@/hooks/use-members";
import { useMemberHistory } from "@/components/members/use-member-history";

const STATUS_VARIANT: Record<Member["status"], BadgeVariant> = { Active: "success", Suspended: "destructive", Expired: "warning" };
const LOAN_VARIANT: Record<string, BadgeVariant> = { Active: "accent", Overdue: "destructive", Returned: "success", Cancelled: "muted", Lost: "destructive" };
const REQ_VARIANT: Record<string, BadgeVariant> = { Pending: "warning", Issued: "success", Rejected: "destructive", Expired: "muted", Cancelled: "muted" };
const FINE_VARIANT: Record<string, BadgeVariant> = { Unpaid: "destructive", "Partially Paid": "warning", Paid: "success", Waived: "muted", Voided: "muted" };

const fmtDate = (d?: string | null) => (d ? formatDhaka(d) : "—");

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-[13px] border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right break-words min-w-0">{children || "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="rounded-md border border-border px-3">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[13px] text-muted-foreground py-4 text-center">{text}</p>;
}

interface Props {
  member: Member | null;
  tab: "profile" | "history";
  onTabChange: (t: "profile" | "history") => void;
  onClose: () => void;
  onEdit: (m: Member) => void;
  /** Create (no login yet) or reset (has login) the member's website login. */
  onLogin?: (m: Member) => void;
  canWrite?: boolean;
}

export function MemberViewDrawer({ member, tab, onTabChange, onClose, onEdit, onLogin, canWrite = true }: Props) {
  const { history, loading, error } = useMemberHistory(member?.memberId ?? null);
  const address = member ? [member.addressLine, member.city, member.district, member.postalCode].some(Boolean) : false;
  const g = member?.guarantor;
  const hasGuarantor = g ? Object.values(g).some(Boolean) : false;

  const loans = history?.loans ?? [];
  const current = loans.filter((l) => l.derivedStatus === "Active" || l.derivedStatus === "Overdue");
  const paid = (history?.fines ?? []).reduce((s, f) => s + f.amountPaid, 0);

  return (
    <Sheet open={!!member} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full md:max-w-lg p-0 flex flex-col">
        {member && (
          <>
            <SheetHeader className="p-4 border-b border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {member.avatar ? <img src={member.avatar} alt="" className="h-12 w-12 object-cover" /> : <User className="h-5 w-5 text-muted-foreground/60" />}
                </div>
                <div className="min-w-0 text-left">
                  <SheetTitle className="text-base truncate">{member.name}</SheetTitle>
                  <SheetDescription className="font-mono text-[12px]">{member.memberId}</SheetDescription>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <StatusBadge variant={STATUS_VARIANT[member.status]}>{member.status}</StatusBadge>
                    <StatusBadge variant={member.meritGrade === "Not Assigned" ? "muted" : "default"}>Merit: {member.meritGrade}</StatusBadge>
                    {member.archivedAt && <StatusBadge variant="muted">Archived</StatusBadge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {canWrite && <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1" onClick={() => onEdit(member)}><Pencil className="h-3 w-3" /> Edit Member</Button>}
                {canWrite && onLogin && !member.archivedAt && (
                  <Button size="sm" variant="outline" className="h-7 text-[12px] gap-1" onClick={() => onLogin(member)}>
                    <KeyRound className="h-3 w-3" /> {member.hasLogin ? "Reset login" : "Create login"}
                  </Button>
                )}
                <Button size="sm" variant={tab === "history" ? "default" : "outline"} className="h-7 text-[12px] gap-1" onClick={() => onTabChange(tab === "history" ? "profile" : "history")}><History className="h-3 w-3" /> History</Button>
              </div>
            </SheetHeader>

            <Tabs value={tab} onValueChange={(v) => onTabChange(v as "profile" | "history")} className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-4 mt-3 self-start">
                <TabsTrigger value="profile" className="text-[12px]">Profile</TabsTrigger>
                <TabsTrigger value="history" className="text-[12px]">History</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                <Section title="Contact">
                  <Row label="Phone">{member.phone && <a href={`tel:${member.phone}`} className="inline-flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" />{member.phone}</a>}</Row>
                  <Row label="Email">{member.email && <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" />{member.email}</a>}</Row>
                  <Row label="NID"><span className="font-mono">{member.nid}</span></Row>
                  {address ? (
                    <>
                      <Row label="Address Line">{member.addressLine}</Row>
                      <Row label="City/Area">{member.city}</Row>
                      <Row label="District">{member.district}</Row>
                      <Row label="Postal Code">{member.postalCode}</Row>
                    </>
                  ) : <Row label="Address">No address on file</Row>}
                </Section>
                <Section title="Default Guarantor">
                  {hasGuarantor && g ? (
                    <>
                      <Row label="Name">{g.name}{g.relationship ? ` (${g.relationship})` : ""}</Row>
                      <Row label="Phone">{g.phone}</Row>
                      <Row label="NID"><span className="font-mono">{g.nid}</span></Row>
                      <Row label="Address">{[g.street, g.city, g.district, g.postalCode].filter(Boolean).join(", ")}</Row>
                    </>
                  ) : <Row label="Guarantor">None saved</Row>}
                </Section>
                <Section title="Membership">
                  <Row label="Join Date">{fmtDate(member.joinDate)}</Row>
                  <Row label="Status">{member.status}</Row>
                  <Row label="Merit Grade">{member.meritGrade}</Row>
                  <Row label="Merit Note">{member.meritNote}</Row>
                  <Row label="Website login">
                    {member.hasLogin
                      ? member.mustChangePassword ? "Created · temporary password not changed yet" : "Active"
                      : "No login yet"}
                  </Row>
                </Section>
                <Section title="Current Library Activity">
                  <Row label="Active Loans">{String(member.activeLoans)}</Row>
                  <Row label="Overdue Books">{String(member.overdueLoans)}</Row>
                  <Row label="Web Holds">{String(member.activeHolds)}</Row>
                  <Row label="Outstanding Fines">{formatTaka(member.fines)}</Row>
                  {member.accruingFines > 0 && <Row label="Running late fees">{formatTaka(member.accruingFines)}</Row>}
                  {loading ? <Empty text="Loading…" /> : current.length === 0 ? <Empty text="No books currently borrowed." /> : current.map((l) => (
                    <Row key={l.id} label={`${l.bookTitle} (${l.bookId})`}>
                      <span className={l.derivedStatus === "Overdue" ? "text-destructive" : ""}>Due {fmtDate(l.dueDate)}</span>
                    </Row>
                  ))}
                </Section>
                <Section title="Library Summary">
                  <Row label="Total Loans">{String(loans.length)}</Row>
                  <Row label="Returned Loans">{String(loans.filter((l) => l.derivedStatus === "Returned").length)}</Row>
                  <Row label="Late Returns">{String(loans.filter((l) => l.daysOverdue > 0).length)}</Row>
                  <Row label="Fines Paid">{formatTaka(paid)}</Row>
                </Section>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                {loading && <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading history…</div>}
                {error && <p className="text-[12px] text-destructive">{error}</p>}
                {history && (
                  <>
                    <Section title="Loans">
                      {history.loans.length === 0 ? <Empty text="No loan history for this member." /> : history.loans.map((l) => (
                        <div key={l.id} className="py-2 border-b border-border/50 last:border-0 text-[12px] space-y-0.5">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-foreground text-[13px]">{l.bookTitle}</span>
                            <StatusBadge variant={LOAN_VARIANT[l.derivedStatus] ?? "default"}>{l.derivedStatus}</StatusBadge>
                          </div>
                          <p className="text-muted-foreground font-mono">{l.bookId} · {l.id}</p>
                          <p className="text-muted-foreground">Issued {fmtDate(l.issuedDate)} · Due {fmtDate(l.dueDate)} · Returned {fmtDate(l.returnDate)}{l.renewalCount ? ` · Renewed ${l.renewalCount}×` : ""}</p>
                          {l.fineAmount > 0 && (
                            <p className="text-muted-foreground">{l.daysOverdue} days late · {l.fineIsAccruing ? "Running fine" : "Fine"} {formatTaka(l.fineAmount)}{l.fineStatus ? ` (${l.fineStatus})` : ""}</p>
                          )}
                        </div>
                      ))}
                    </Section>
                    <Section title="Web Requests">
                      {history.requests.length === 0 ? <Empty text="No web requests." /> : history.requests.map((r) => (
                        <div key={r.id} className="py-2 border-b border-border/50 last:border-0 text-[12px] space-y-0.5">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-foreground text-[13px]">{r.bookTitle}</span>
                            <StatusBadge variant={REQ_VARIANT[r.status] ?? "default"}>{r.status}</StatusBadge>
                          </div>
                          <p className="text-muted-foreground font-mono">{r.id}{r.loanId ? ` → ${r.loanId}` : ""}</p>
                          <p className="text-muted-foreground">Requested {fmtDate(r.createdAt)} · Pickup {fmtDate(r.pickupDate)} · Hold until {fmtDate(r.expiresAt)}</p>
                          {r.reason && <p className="text-muted-foreground">Reason: {r.reason}</p>}
                        </div>
                      ))}
                    </Section>
                    <Section title="Fines & Payments">
                      {history.fines.length === 0 ? <Empty text="No fines or payments." /> : history.fines.map((f) => (
                        <div key={f.id} className="py-2 border-b border-border/50 last:border-0 text-[12px] space-y-0.5">
                          <div className="flex justify-between gap-2">
                            <span className="font-mono text-foreground">{f.id} · {f.kind} · {f.loanId}</span>
                            <StatusBadge variant={FINE_VARIANT[f.status] ?? "default"}>{f.status}</StatusBadge>
                          </div>
                          <p className="text-muted-foreground">Fine {formatTaka(f.amount)} · Paid {formatTaka(f.amountPaid)}{f.kind === "Overdue" ? ` · ${f.daysOverdue} days late` : ""}</p>
                          {f.payments.map((p) => (
                            <p key={p.id} className="text-muted-foreground">Paid {formatTaka(p.amount)} on {fmtDate(p.paidAt)} via {p.method}{p.reference ? ` · Ref ${p.reference}` : ""}</p>
                          ))}
                          {f.waiver && <p className="text-muted-foreground">Waived {formatTaka(f.waiver.amount)} on {fmtDate(f.waiver.waivedAt)} — {f.waiver.reason}</p>}
                        </div>
                      ))}
                    </Section>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

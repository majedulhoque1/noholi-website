import { Link } from "react-router-dom";
import {
  BookOpen, ArrowLeftRight, AlertTriangle, Users, Gift, Clock, BadgeDollarSign, Package, FileCheck, Loader2, Globe, UserPlus, Bookmark,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { formatDhaka } from "@/lib/dhaka-date";
import { formatTaka } from "@/lib/currency";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
}

function StatCard({ label, value, icon: Icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded p-3 flex items-start gap-2.5">
      <div className="p-1.5 bg-secondary rounded">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground leading-tight">{label}</p>
        <p className="text-lg font-semibold text-foreground leading-tight mt-0.5">{value}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function formatNum(n: number) {
  return n.toLocaleString("en-BD");
}

/** Turns an audit action ("issue_loan", "update") into a readable phrase. */
function describeAction(action: string, entity: string) {
  const known: Record<string, string> = {
    issue_loan: "Book issued",
    issue_from_request: "Web request issued",
    return_loan: "Book returned",
    void_loan: "Loan voided",
    mark_lost: "Book marked lost",
    extend_loan: "Loan extended",
    renew_my_loan: "Loan renewed by member",
    submit_borrow_request: "Web request placed",
    cancel_my_request: "Web request cancelled",
    reject_request: "Web request rejected",
    expire_holds: "Holds expired",
    record_fine_payment: "Fine payment recorded",
    waive_fine: "Fine waived",
    adjust_stock: "Stock adjusted",
    add_donation_to_inventory: "Donation added to inventory",
    approve_application: "Application approved",
    reject_application: "Application rejected",
    update_settings: "Settings changed",
    create_member_login: "Member login created",
    reset_member_login: "Member login reset",
    create_staff_login: "Staff login created",
  };
  if (known[action]) return known[action];
  const noun = entity.replace(/_/g, " ").replace(/s$/, "");
  if (action === "insert") return `New ${noun}`;
  if (action === "update") return `${noun[0]?.toUpperCase() ?? ""}${noun.slice(1)} edited`;
  if (action === "delete") return `${noun[0]?.toUpperCase() ?? ""}${noun.slice(1)} deleted`;
  return action.replace(/_/g, " ");
}

export default function Dashboard() {
  const { stats, activity, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-[13px]">Loading dashboard…</span>
      </div>
    );
  }

  const alerts = [
    { label: "Overdue books", value: formatNum(stats.overdueLoans), icon: Clock, to: "/lending", show: true },
    { label: "Web requests waiting", value: formatNum(stats.pendingRequests), icon: Globe, to: "/lending", show: true },
    {
      label: "Unpaid fines",
      value: stats.unpaidFines ? `${formatNum(stats.unpaidFines)} · ${formatTaka(stats.outstandingAmount)}` : "0",
      icon: BadgeDollarSign, to: "/fines", show: true,
    },
    { label: "Donation approvals", value: formatNum(stats.donationApprovals), icon: FileCheck, to: "/donations", show: true },
    { label: "Membership applications", value: formatNum(stats.pendingApplications), icon: UserPlus, to: "/members", show: stats.pendingApplications > 0 },
    { label: "Low stock titles", value: formatNum(stats.lowStock), icon: Package, to: "/inventory", show: stats.lowStock > 0 },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground">Overview of library operations</p>
      </div>

      {error && <p className="text-[12px] text-destructive" role="alert">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <StatCard label="Total Books" value={formatNum(stats.totalBooks)} icon={BookOpen} subtitle={`${formatNum(stats.totalCopies)} copies`} />
        <StatCard label="Books on Loan" value={formatNum(stats.booksOnLoan)} icon={ArrowLeftRight} />
        <StatCard label="Overdue" value={formatNum(stats.overdueLoans)} icon={AlertTriangle} />
        <StatCard label="Active Members" value={formatNum(stats.activeMembers)} icon={Users} />
        <StatCard label="Donations (Month)" value={formatNum(stats.donationsThisMonth)} icon={Gift} />
        <StatCard label="Reserved" value={formatNum(stats.reserved)} icon={Bookmark} subtitle="held for web requests" />
      </div>

      <div className="bg-card border border-border rounded p-3">
        <h2 className="text-[13px] font-semibold text-foreground mb-2">Attention Required</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {alerts.filter((a) => a.show).map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-2 rounded border border-border p-2 bg-secondary/30 hover:bg-secondary/60 transition-colors"
            >
              <a.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] text-muted-foreground leading-tight">{a.label}</p>
                <p className="text-sm font-semibold text-foreground leading-tight">{a.value}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded p-3">
        <h2 className="text-[13px] font-semibold text-foreground mb-1">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="flex flex-col gap-0.5 py-1.5 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="min-w-0 break-words sm:truncate">
                  <span className="text-foreground">{describeAction(a.action, a.entity)}</span>
                  {a.entityId && <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{a.entityId}</span>}
                  {a.actorRole !== "staff" && a.actorRole !== "admin" && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground">by {a.actorRole}</span>
                  )}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDhaka(a.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

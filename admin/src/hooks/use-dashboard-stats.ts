import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { describeError } from "@/lib/rpc";
import { todayDhaka } from "@/lib/dhaka-date";
import { fetchInventoryStats } from "./use-inventory";

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  booksOnLoan: number;
  reserved: number;
  lowStock: number;
  overdueLoans: number;
  activeMembers: number;
  donationsThisMonth: number;
  /** Fines with a balance (Unpaid / Partially Paid). */
  unpaidFines: number;
  outstandingAmount: number;
  pendingRequests: number;
  donationApprovals: number;
  pendingApplications: number;
}

export interface ActivityItem {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  actorRole: string;
  at: string;
}

const EMPTY: DashboardStats = {
  totalBooks: 0, totalCopies: 0, booksOnLoan: 0, reserved: 0, lowStock: 0, overdueLoans: 0,
  activeMembers: 0, donationsThisMonth: 0, unpaidFines: 0, outstandingAmount: 0,
  pendingRequests: 0, donationApprovals: 0, pendingApplications: 0,
};

type Filter = ["eq" | "is" | "gte", string, string | null];
interface CountQuery extends PromiseLike<{ count: number | null; error: unknown }> {
  eq(col: string, val: unknown): CountQuery;
  is(col: string, val: null): CountQuery;
  gte(col: string, val: unknown): CountQuery;
}

/** Counts a table/view with a HEAD request (no rows transferred). */
async function count(table: string, filters: Filter[] = []): Promise<number> {
  let q = (supabase.from(table as never).select("*", { count: "exact", head: true }) as unknown) as CountQuery;
  for (const [op, col, val] of filters) {
    q = op === "is" ? q.is(col, null) : q[op](col, val);
  }
  const { count: n, error } = await q;
  if (error) throw new Error(`${table}: ${describeError(error).message}`);
  return n ?? 0;
}

async function loadStats(): Promise<DashboardStats> {
  const monthStart = `${todayDhaka().slice(0, 7)}-01`;
  const [inv, overdueLoans, activeMembers, donationsThisMonth, pendingRequests, donationApprovals, pendingApplications, fines] =
    await Promise.all([
      fetchInventoryStats(),
      count("overdue_list_v"),
      count("members", [["eq", "status", "Active"], ["is", "archived_at", null]]),
      count("donations", [["gte", "date_received", monthStart]]),
      count("borrow_requests", [["eq", "status", "Pending"]]),
      count("donations", [["eq", "review_status", "Pending"]]),
      count("member_applications", [["eq", "status", "Pending"]]),
      supabase.from("fines").select("amount, amount_paid").in("status", ["Unpaid", "Partially Paid"]),
    ]);
  if (fines.error) throw new Error(describeError(fines.error).message);
  const open = (fines.data ?? []) as unknown as { amount: number; amount_paid: number }[];
  return {
    totalBooks: inv.titles,
    totalCopies: inv.totalCopies,
    booksOnLoan: inv.issued,
    reserved: inv.reserved,
    lowStock: inv.lowStock,
    overdueLoans,
    activeMembers,
    donationsThisMonth,
    unpaidFines: open.length,
    outstandingAmount: open.reduce((s, f) => s + Number(f.amount) - Number(f.amount_paid), 0),
    pendingRequests,
    donationApprovals,
    pendingApplications,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadStats()
      .then((s) => { if (!cancelled) setStats(s); })
      .catch((e) => { if (!cancelled) setError(describeError(e).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    supabase
      .from("audit_log")
      .select("id, action, entity, entity_id, actor_role, at")
      .order("at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setActivity(
          ((data ?? []) as unknown as { id: number; action: string; entity: string; entity_id: string | null; actor_role: string; at: string }[])
            .map((r) => ({ id: r.id, action: r.action, entity: r.entity, entityId: r.entity_id, actorRole: r.actor_role, at: r.at })),
        );
      });
    return () => { cancelled = true; };
  }, []);

  return { stats, activity, loading, error };
}

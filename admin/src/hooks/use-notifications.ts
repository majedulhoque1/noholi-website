import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { describeError } from "@/lib/rpc";
import { todayDhaka, formatDhaka } from "@/lib/dhaka-date";

/** Every notification is derived from live data; nothing is stored or seeded. */
export type NotificationType = "application" | "request" | "overdue" | "hold" | "message";
export type NotificationPriority = "normal" | "warning" | "critical";

export interface Notification {
  /** Stable per underlying record, so "read" survives polling. */
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
  redirect_url?: string;
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  application: "Applications",
  request: "Web requests",
  overdue: "Overdue",
  hold: "Expiring holds",
  message: "Messages",
};

const POLL_MS = 60_000;
const PRIORITY_RANK: Record<NotificationPriority, number> = { critical: 0, warning: 1, normal: 2 };

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type RawNotification = Omit<Notification, "is_read">;

async function fetchNotifications(): Promise<RawNotification[]> {
  const today = todayDhaka();
  const [apps, reqs, overdue, msgs] = await Promise.all([
    supabase.from("member_applications").select("id, name, phone, created_at").eq("status", "Pending").order("created_at", { ascending: false }).limit(50),
    supabase.from("borrow_requests").select("id, member_name, book_title, pickup_date, expires_at, created_at").eq("status", "Pending").order("created_at", { ascending: false }).limit(100),
    supabase.from("overdue_list_v").select("loan_id, member_name, book_title, due_date, days_overdue").order("due_date", { ascending: false }),
    supabase.from("contact_messages").select("id, name, subject, message, created_at").eq("status", "New").order("created_at", { ascending: false }).limit(50),
  ]);
  const err = apps.error || reqs.error || overdue.error || msgs.error;
  if (err) throw new Error(describeError(err).message);

  const out: RawNotification[] = [];
  for (const a of apps.data ?? []) {
    out.push({
      id: `app:${a.id}`, type: "application", priority: "warning",
      title: "New membership application",
      message: `${a.name} (${a.id}) applied on the website. Call ${a.phone} to follow up.`,
      created_at: a.created_at, redirect_url: "/members?tab=applications",
    });
  }
  for (const r of reqs.data ?? []) {
    out.push({
      id: `req:${r.id}`, type: "request", priority: "normal",
      title: "Web request waiting",
      message: `${r.member_name} asked for "${r.book_title}" (${r.id}), pickup ${formatDhaka(r.pickup_date)}.`,
      created_at: r.created_at, redirect_url: "/lending",
    });
    if (r.expires_at && r.expires_at <= today) {
      out.push({
        id: `hold:${r.id}:${r.expires_at}`, type: "hold", priority: "warning",
        title: "Hold expires tonight",
        message: `The hold on "${r.book_title}" for ${r.member_name} (${r.id}) ends today and is released at midnight.`,
        created_at: r.created_at, redirect_url: "/lending",
      });
    }
  }
  const od = overdue.data ?? [];
  if (od.length > 0) {
    const newest = od[0];
    const preview = od.slice(0, 3).map((l) => `${l.member_name}: "${l.book_title}" (${l.days_overdue}d)`).join("; ");
    out.push({
      // Changes when the count changes, so a new overdue loan shows as unread again.
      id: `overdue:${today}:${od.length}`, type: "overdue", priority: "critical",
      title: `${od.length} overdue loan${od.length === 1 ? "" : "s"}`,
      message: preview + (od.length > 3 ? ` and ${od.length - 3} more.` : "."),
      // The newest loan became overdue the day after its due date.
      created_at: `${newest.due_date}T18:00:00Z`, redirect_url: "/lending",
    });
  }
  for (const m of msgs.data ?? []) {
    out.push({
      id: `msg:${m.id}`, type: "message", priority: "normal",
      title: m.subject ? `Message: ${m.subject}` : "New contact message",
      message: `${m.name}: ${m.message.length > 120 ? `${m.message.slice(0, 120)}…` : m.message}`,
      created_at: m.created_at, redirect_url: "/messages",
    });
  }
  return out.sort((a, b) =>
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.created_at.localeCompare(a.created_at));
}

// "Read" is a per-browser convenience only; the alerts themselves come from the database.
function readKey(userId: string) { return `noholi-os:read-notifications:${userId}`; }
function loadRead(userId: string | undefined): Set<string> {
  if (!userId) return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(readKey(userId)) ?? "[]") as string[]); } catch { return new Set(); }
}
function saveRead(userId: string | undefined, ids: Set<string>, live: string[]) {
  if (!userId) return;
  // Keep only ids that still exist so storage never grows without bound.
  const keep = live.filter((id) => ids.has(id));
  try { localStorage.setItem(readKey(userId), JSON.stringify(keep)); } catch { /* storage unavailable */ }
}

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["notifications", userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
  const [readIds, setReadIds] = useState<Set<string>>(() => loadRead(userId));
  useEffect(() => { setReadIds(loadRead(userId)); }, [userId]);

  const raw = query.data;
  const notifications: Notification[] = useMemo(
    () => (raw ?? []).map((n) => ({ ...n, is_read: readIds.has(n.id) })),
    [raw, readIds],
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const persist = useCallback((next: Set<string>) => {
    setReadIds(next);
    saveRead(userId, next, (raw ?? []).map((n) => n.id));
  }, [userId, raw]);

  const markAsRead = useCallback((id: string) => {
    const next = new Set(readIds); next.add(id); persist(next);
  }, [readIds, persist]);

  const markAllAsRead = useCallback(() => {
    persist(new Set([...readIds, ...(raw ?? []).map((n) => n.id)]));
  }, [readIds, raw, persist]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    timeAgo,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { callRpc, describeError, type Result } from "@/lib/rpc";
import { signMemberPhotos } from "@/hooks/use-members";

export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export interface Application {
  id: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  photoPath: string | null;
  photoUrl?: string;
  status: ApplicationStatus;
  contacted: boolean;
  rejectionReason: string;
  memberId: string | null;
  createdAt: string;
  decidedAt: string | null;
}

const s = (v: unknown) => (v == null ? "" : String(v));

/** "Become a member" applications from the website (CONTRACT.md §2 member_applications). */
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("member_applications")
      .select("id, name, phone, email, street, city, district, postal_code, photo_path, status, contacted, rejection_reason, member_id, created_at, decided_at")
      .order("created_at", { ascending: false });
    if (err) {
      setError(describeError(err).message);
      return;
    }
    const rows = data ?? [];
    const urls = await signMemberPhotos(rows.map((r) => r.photo_path));
    setApplications(rows.map((r) => ({
      id: r.id, name: s(r.name), phone: s(r.phone), email: s(r.email), street: s(r.street), city: s(r.city),
      district: s(r.district), postalCode: s(r.postal_code), photoPath: r.photo_path ?? null,
      photoUrl: r.photo_path ? urls[r.photo_path] : undefined, status: r.status as ApplicationStatus,
      contacted: !!r.contacted, rejectionReason: s(r.rejection_reason), memberId: r.member_id ?? null,
      createdAt: s(r.created_at), decidedAt: r.decided_at ?? null,
    })));
    setError(null);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  /** Staff may update only the `contacted` column directly. */
  const setContacted = useCallback(async (id: string, contacted: boolean): Promise<Result> => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, contacted } : a)));
    const { error: err } = await supabase.from("member_applications").update({ contacted }).eq("id", id);
    if (err) {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, contacted: !contacted } : a)));
      return { success: false, error: describeError(err).message, code: describeError(err).code };
    }
    return { success: true, data: undefined };
  }, []);

  /** Returns the new MEM-#### id. */
  const approve = useCallback(async (id: string) => {
    const r = await callRpc<string>("approve_application", { p_application_id: id });
    await reload();
    return r;
  }, [reload]);

  const reject = useCallback(async (id: string, reason: string) => {
    const r = await callRpc("reject_application", { p_application_id: id, p_reason: reason.trim() });
    await reload();
    return r;
  }, [reload]);

  return { applications, loading, error, reload, setContacted, approve, reject };
}

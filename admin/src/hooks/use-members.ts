import { useState, useEffect, useCallback } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { describeError, type Result } from "@/lib/rpc";

export const MERIT_GRADES = ["A", "B", "C", "D", "E", "Not Assigned"] as const;
export type MeritGrade = typeof MERIT_GRADES[number];

export interface DefaultGuarantor {
  name: string;
  relationship: string;
  phone: string;
  nid: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface Member {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  /** Active loans (from member_summary_v). */
  activeLoans: number;
  /** Unpaid balance of settled fines (member_summary_v.outstanding_fines). */
  fines: number;
  status: "Active" | "Suspended" | "Expired";
  /** Displayable image URL (signed URL for member-photos paths). */
  avatar?: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
  meritGrade: MeritGrade;
  meritNote: string;
  joinDate: string;
  // --- added with the Supabase backend ---
  nid: string;
  guarantor: DefaultGuarantor;
  overdueLoans: number;
  activeHolds: number;
  /** Running fines on active overdue loans. */
  accruingFines: number;
  hasLogin: boolean;
  mustChangePassword: boolean;
  archivedAt: string | null;
  /** Raw `members.avatar` value (storage path or URL). */
  avatarPath: string | null;
}

/** Everything staff can type into the Add / Edit member form. */
export interface MemberInput {
  name: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
  status: Member["status"];
  meritGrade: MeritGrade;
  meritNote: string;
  nid: string;
  guarantor: DefaultGuarantor;
}

export const emptyGuarantor = (): DefaultGuarantor => ({
  name: "", relationship: "", phone: "", nid: "", street: "", city: "", district: "", postalCode: "",
});

export const emptyMemberInput = (): MemberInput => ({
  name: "", email: "", phone: "", addressLine: "", city: "", district: "", postalCode: "",
  status: "Active", meritGrade: "Not Assigned", meritNote: "", nid: "", guarantor: emptyGuarantor(),
});

export function memberToInput(m: Member): MemberInput {
  return {
    name: m.name, email: m.email, phone: m.phone, addressLine: m.addressLine, city: m.city,
    district: m.district, postalCode: m.postalCode, status: m.status, meritGrade: m.meritGrade,
    meritNote: m.meritNote, nid: m.nid, guarantor: { ...m.guarantor },
  };
}

/** NIDs are shown as "•••• 1234" everywhere except the member drawer. */
export function maskNid(nid?: string | null): string {
  const v = (nid ?? "").replace(/\s+/g, "");
  if (!v) return "";
  return `•••• ${v.slice(-4)}`;
}

const s = (v: unknown) => (v == null ? "" : String(v));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToMember(row: any, photoUrls: Record<string, string>): Member {
  const avatarPath: string | null = row.avatar ?? null;
  const avatar = avatarPath
    ? /^https?:|^data:/.test(avatarPath) ? avatarPath : photoUrls[avatarPath]
    : undefined;
  return {
    memberId: row.id,
    name: row.name ?? "",
    email: s(row.email),
    phone: s(row.phone),
    activeLoans: Number(row.active_loans) || 0,
    fines: Number(row.outstanding_fines) || 0,
    status: row.status as Member["status"],
    avatar,
    addressLine: s(row.address_line),
    city: s(row.city),
    district: s(row.district),
    postalCode: s(row.postal_code),
    meritGrade: (MERIT_GRADES as readonly string[]).includes(row.merit_grade) ? row.merit_grade : "Not Assigned",
    meritNote: s(row.merit_note),
    joinDate: s(row.created_at),
    nid: s(row.nid),
    guarantor: {
      name: s(row.default_guarantor_name),
      relationship: s(row.default_guarantor_relationship),
      phone: s(row.default_guarantor_phone),
      nid: s(row.default_guarantor_nid),
      street: s(row.default_guarantor_street),
      city: s(row.default_guarantor_city),
      district: s(row.default_guarantor_district),
      postalCode: s(row.default_guarantor_postal_code),
    },
    overdueLoans: Number(row.overdue_loans) || 0,
    activeHolds: Number(row.active_holds) || 0,
    accruingFines: Number(row.accruing_fines) || 0,
    hasLogin: !!row.auth_user_id,
    mustChangePassword: !!row.must_change_password,
    archivedAt: row.archived_at ?? null,
    avatarPath,
  };
}

const nul = (v: string) => (v.trim() === "" ? null : v.trim());

/** Maps form fields to the member columns staff may write (see CONTRACT.md §2 members). */
function inputToDb(u: Partial<MemberInput>) {
  const out: Record<string, unknown> = {};
  if (u.name !== undefined) out.name = u.name.trim();
  if (u.email !== undefined) out.email = nul(u.email);
  if (u.phone !== undefined) out.phone = nul(u.phone);
  if (u.addressLine !== undefined) out.address_line = nul(u.addressLine);
  if (u.city !== undefined) out.city = nul(u.city);
  if (u.district !== undefined) out.district = nul(u.district);
  if (u.postalCode !== undefined) out.postal_code = nul(u.postalCode);
  if (u.status !== undefined) out.status = u.status;
  if (u.meritGrade !== undefined) out.merit_grade = u.meritGrade;
  if (u.meritNote !== undefined) out.merit_note = nul(u.meritNote);
  if (u.nid !== undefined) out.nid = nul(u.nid);
  if (u.guarantor !== undefined) {
    const g = u.guarantor;
    out.default_guarantor_name = nul(g.name);
    out.default_guarantor_relationship = nul(g.relationship);
    out.default_guarantor_phone = nul(g.phone);
    out.default_guarantor_nid = nul(g.nid);
    out.default_guarantor_street = nul(g.street);
    out.default_guarantor_city = nul(g.city);
    out.default_guarantor_district = nul(g.district);
    out.default_guarantor_postal_code = nul(g.postalCode);
  }
  return out;
}

/** Signed URLs for private `member-photos` paths (1 hour). Missing/failed paths are skipped. */
export async function signMemberPhotos(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p && !/^https?:|^data:/.test(p)))];
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage.from("member-photos").createSignedUrls(unique, 3600);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const r of data) if (r.path && r.signedUrl && !r.error) out[r.path] = r.signedUrl;
  return out;
}

/**
 * Calls an edge function and normalises the `{ error: { code, message } }` body
 * the Noholi functions return on 4xx/5xx (CONTRACT.md §5).
 */
export async function invokeEdge<T>(name: string, body: Record<string, unknown>): Promise<Result<T>> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return { success: true, data: data as T };
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await (error.context as Response).json();
      const e = payload?.error;
      if (e?.message) return { success: false, error: e.message, code: e.code };
    } catch { /* fall through */ }
  }
  const d = describeError(error);
  return { success: false, error: d.message, code: d.code };
}

export interface MemberLoginResult {
  member_id: string;
  login_email: string;
  temp_password: string;
  must_change_password: boolean;
}

export const createMemberLogin = (memberId: string) =>
  invokeEdge<MemberLoginResult>("create-member-login", { member_id: memberId });
export const resetMemberLogin = (memberId: string) =>
  invokeEdge<MemberLoginResult>("reset-member-login", { member_id: memberId });

function toError(err: unknown): Error {
  return new Error(describeError(err).message);
}

/**
 * Members with their live counters from `member_summary_v`.
 * `members` excludes archived members (Lending's Issue Book uses it); `archivedMembers` has the rest.
 */
export function useMembers() {
  const [all, setAll] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase.from("member_summary_v").select("*").order("id");
    if (err) {
      setError(describeError(err).message);
      return;
    }
    const rows = data ?? [];
    const urls = await signMemberPhotos(rows.map((r) => r.avatar));
    setAll(rows.map((r) => dbToMember(r, urls)));
    setError(null);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  /** Inserts a member; the database generates the MEM-#### id. Throws with a readable message. */
  const addMember = useCallback(async (member: Partial<MemberInput> & { name: string }) => {
    const { data, error: err } = await supabase
      .from("members")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(inputToDb(member) as any)
      .select("id")
      .single();
    if (err) throw toError(err);
    await reload();
    return data.id as string;
  }, [reload]);

  const updateMember = useCallback(async (memberId: string, updates: Partial<MemberInput>) => {
    const { error: err } = await supabase
      .from("members")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(inputToDb(updates) as any)
      .eq("id", memberId);
    if (err) throw toError(err);
    await reload();
  }, [reload]);

  const updateStatus = useCallback(
    (memberId: string, newStatus: Member["status"]) => updateMember(memberId, { status: newStatus }),
    [updateMember],
  );

  /** Hard delete: only allowed without history or login (else NH014 → archive). */
  const deleteMember = useCallback(async (memberId: string) => {
    const { error: err } = await supabase.from("members").delete().eq("id", memberId);
    if (err) throw toError(err);
    await reload();
  }, [reload]);

  const archiveMember = useCallback(async (memberId: string) => {
    const { error: err } = await supabase
      .from("members").update({ archived_at: new Date().toISOString() }).eq("id", memberId);
    if (err) throw toError(err);
    await reload();
  }, [reload]);

  const restoreMember = useCallback(async (memberId: string) => {
    const { error: err } = await supabase.from("members").update({ archived_at: null }).eq("id", memberId);
    if (err) throw toError(err);
    await reload();
  }, [reload]);

  const members = all.filter((m) => !m.archivedAt);
  const archivedMembers = all.filter((m) => !!m.archivedAt);

  return {
    members, archivedMembers, loading, error, reload,
    addMember, updateStatus, updateMember, deleteMember, archiveMember, restoreMember,
  };
}

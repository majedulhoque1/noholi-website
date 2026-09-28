import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { describeError } from "@/lib/rpc";
import { callRpc, type Outcome } from "./use-inventory";
import { todayDhaka } from "@/lib/dhaka-date";

/* ------------------------------------------------------------------
 * Lending. Reads come from `loan_status_v` (Overdue is derived there in
 * Dhaka time, never stored) and `borrow_requests`. Every write is an RPC
 * (issue_loan, issue_from_request, return_loan, void_loan, mark_lost,
 * extend_loan, reject_request); the database moves the copy counts.
 * ------------------------------------------------------------------ */

export type LoanStatus = "Active" | "Overdue" | "Returned" | "Cancelled" | "Lost";

export interface GuarantorDetails {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  nid: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
}

/** Fields update_loan_details accepts (see supabase/CONTRACT.md). */
export interface LoanDetailsChanges {
  guarantor_name?: string;
  guarantor_relationship?: string;
  guarantor_phone?: string;
  guarantor_email?: string;
  guarantor_nid?: string;
  guarantor_street?: string;
  guarantor_city?: string;
  guarantor_district?: string;
  guarantor_postal_code?: string;
  notes?: string;
}

export interface ActiveLoan {
  id: string;
  member: string;
  memberId: string;
  book: string;
  bookId: string;
  accessionId: string;
  issuedDate: string;
  dueDate: string;
  returnDate: string | null;
  /** derived_status from loan_status_v */
  status: LoanStatus;
  guarantor: GuarantorDetails;
  daysOverdue: number;
  /** Running fine while Active (accruing), the fine's amount once closed. */
  fineAmount: number;
  fineIsAccruing: boolean;
  fineId: string | null;
  fineStatus: string | null;
  fineBalance: number;
  notes: string;
  renewalCount: number;
  requestId: string | null;
  createdAt: string;
}

interface LoanRow {
  id: string;
  book_id: string;
  accession_id: string | null;
  book_title: string;
  member_id: string;
  member_name: string;
  issued_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  derived_status: LoanStatus;
  guarantor_name: string | null;
  guarantor_relationship: string | null;
  guarantor_phone: string | null;
  guarantor_email: string | null;
  guarantor_nid: string | null;
  guarantor_street: string | null;
  guarantor_city: string | null;
  guarantor_district: string | null;
  guarantor_postal_code: string | null;
  notes: string | null;
  renewal_count: number | null;
  request_id: string | null;
  created_at: string;
  days_overdue: number | null;
  fine_amount: number | string | null;
  fine_is_accruing: boolean;
  fine_id: string | null;
  fine_status: string | null;
  fine_balance: number | string | null;
}

export function dbToLoan(row: LoanRow): ActiveLoan {
  return {
    id: row.id,
    member: row.member_name,
    memberId: row.member_id,
    book: row.book_title,
    bookId: row.book_id,
    accessionId: row.accession_id || row.book_id,
    issuedDate: row.issued_date,
    dueDate: row.due_date,
    returnDate: row.return_date,
    status: row.derived_status,
    guarantor: {
      name: row.guarantor_name ?? "",
      phone: row.guarantor_phone ?? "",
      email: row.guarantor_email ?? "",
      relationship: row.guarantor_relationship ?? "",
      nid: row.guarantor_nid ?? "",
      street: row.guarantor_street ?? "",
      city: row.guarantor_city ?? "",
      district: row.guarantor_district ?? "",
      postalCode: row.guarantor_postal_code ?? "",
    },
    daysOverdue: row.days_overdue ?? 0,
    fineAmount: Number(row.fine_amount ?? 0),
    fineIsAccruing: row.fine_is_accruing,
    fineId: row.fine_id,
    fineStatus: row.fine_status,
    fineBalance: Number(row.fine_balance ?? 0),
    notes: row.notes ?? "",
    renewalCount: row.renewal_count ?? 0,
    requestId: row.request_id,
    createdAt: row.created_at,
  };
}

/** Masks an NID to its last 4 digits (contract: never show full NIDs in lists). */
export function maskNid(nid: string | null | undefined): string {
  if (!nid) return "—";
  const digits = nid.replace(/\s+/g, "");
  return digits.length <= 4 ? digits : `•••• ${digits.slice(-4)}`;
}

/* ------------------------------------------------------------ settings */

export interface LibrarySettings {
  loanDays: number;
  maxItems: number;
  finePerDay: number;
  holdGraceDays: number;
  renewalsAllowed: number;
  /** Dhaka date according to the database. */
  today: string;
}

const DEFAULT_SETTINGS: LibrarySettings = {
  loanDays: 14, maxItems: 5, finePerDay: 10, holdGraceDays: 2, renewalsAllowed: 1, today: todayDhaka(),
};

/** Policy numbers from `get_public_settings()` (loan length, item limit, fine rate…). */
export function useLibrarySettings() {
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  useEffect(() => {
    callRpc<Record<string, unknown>>("get_public_settings").then((r) => {
      if (!r.success || !r.data) {
        setSettings(DEFAULT_SETTINGS);
        return;
      }
      const d = r.data;
      setSettings({
        loanDays: Number(d.loan_days ?? 14),
        maxItems: Number(d.max_items ?? 5),
        finePerDay: Number(d.fine_per_day ?? 10),
        holdGraceDays: Number(d.hold_grace_days ?? 2),
        renewalsAllowed: Number(d.renewals_allowed ?? 1),
        today: String(d.today ?? todayDhaka()),
      });
    });
  }, []);
  return settings;
}

/* --------------------------------------------------------------- loans */

async function fetchAllLoans(): Promise<ActiveLoan[]> {
  const out: ActiveLoan[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("loan_status_v")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(describeError(error).message);
    const rows = (data ?? []) as unknown as LoanRow[];
    out.push(...rows.map(dbToLoan));
    if (rows.length < PAGE) break;
  }
  return out;
}

export interface IssueLoanInput {
  memberId: string;
  bookId: string;
  dueDate: string;
  guarantor: GuarantorDetails;
  notes?: string;
}

const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export function useLoans() {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    try {
      setLoans(await fetchAllLoans());
      setError(null);
    } catch (err) {
      setError(describeError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  /** Runs an RPC and reloads the list on success. */
  const run = useCallback(async <T,>(fn: string, args: Record<string, unknown>): Promise<Outcome<T>> => {
    const res = await callRpc<T>(fn, args);
    if (res.success) await fetchLoans();
    return res;
  }, [fetchLoans]);

  const issueLoan = useCallback((input: IssueLoanInput) => {
    const g = input.guarantor;
    return run<{ id: string; due_date: string }>("issue_loan", {
      p_member_id: input.memberId,
      p_book_id: input.bookId,
      p_due_date: input.dueDate || null,
      p_guarantor_name: orNull(g.name),
      p_guarantor_relationship: orNull(g.relationship),
      p_guarantor_phone: orNull(g.phone),
      p_guarantor_email: orNull(g.email),
      p_guarantor_nid: orNull(g.nid),
      p_guarantor_street: orNull(g.street),
      p_guarantor_city: orNull(g.city),
      p_guarantor_district: orNull(g.district),
      p_guarantor_postal_code: orNull(g.postalCode),
      p_notes: orNull(input.notes),
    });
  }, [run]);

  const returnLoan = useCallback((loanId: string, returnDate?: string) =>
    run<{ loan: { id: string }; fine: { id: string; amount: number } | null }>("return_loan", {
      p_loan_id: loanId,
      p_return_date: returnDate || null,
    }), [run]);

  const voidLoan = useCallback((loanId: string, reason: string) =>
    run("void_loan", { p_loan_id: loanId, p_reason: reason }), [run]);

  const markLost = useCallback((loanId: string, note?: string) =>
    run<{ loan: { id: string }; fine: { id: string; amount: number } }>("mark_lost", {
      p_loan_id: loanId,
      p_note: orNull(note),
    }), [run]);

  const extendLoan = useCallback((loanId: string, newDueDate: string) =>
    run<{ due_date: string }>("extend_loan", { p_loan_id: loanId, p_new_due_date: newDueDate }), [run]);

  const updateLoanDetails = useCallback((loanId: string, changes: LoanDetailsChanges) =>
    run("update_loan_details", { p_loan_id: loanId, p_changes: changes }), [run]);

  return {
    loans, loading, error, issueLoan, returnLoan, voidLoan, markLost, extendLoan, updateLoanDetails,
    refetch: fetchLoans,
  };
}

/* -------------------------------------------------------- web requests */

export interface BorrowRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberNid: string;
  bookId: string;
  bookTitle: string;
  pickupDate: string;
  /** Last day the hold is valid. */
  expiresAt: string;
  note: string;
  status: string;
  guarantor: GuarantorDetails;
  guarantorConsent: boolean;
  createdAt: string;
}

interface RequestRow {
  id: string;
  member_id: string;
  member_name: string;
  member_nid: string | null;
  book_id: string;
  book_title: string;
  pickup_date: string;
  expires_at: string;
  note: string | null;
  status: string;
  guarantor_name: string | null;
  guarantor_relationship: string | null;
  guarantor_phone: string | null;
  guarantor_email: string | null;
  guarantor_nid: string | null;
  guarantor_street: string | null;
  guarantor_city: string | null;
  guarantor_district: string | null;
  guarantor_postal_code: string | null;
  guarantor_consent: boolean | null;
  created_at: string;
}

function dbToRequest(r: RequestRow): BorrowRequest {
  return {
    id: r.id,
    memberId: r.member_id,
    memberName: r.member_name,
    memberNid: r.member_nid ?? "",
    bookId: r.book_id,
    bookTitle: r.book_title,
    pickupDate: r.pickup_date,
    expiresAt: r.expires_at,
    note: r.note ?? "",
    status: r.status,
    guarantor: {
      name: r.guarantor_name ?? "",
      phone: r.guarantor_phone ?? "",
      email: r.guarantor_email ?? "",
      relationship: r.guarantor_relationship ?? "",
      nid: r.guarantor_nid ?? "",
      street: r.guarantor_street ?? "",
      city: r.guarantor_city ?? "",
      district: r.guarantor_district ?? "",
      postalCode: r.guarantor_postal_code ?? "",
    },
    guarantorConsent: !!r.guarantor_consent,
    createdAt: r.created_at,
  };
}

const REQUEST_POLL_MS = 60_000;

/** Pending web holds. Refetches on window focus and every 60 s. */
export function useBorrowRequests(onChange?: () => void) {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const fetchRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("borrow_requests")
      .select("*")
      .eq("status", "Pending")
      .order("pickup_date", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setError(describeError(error).message);
    else {
      setRequests(((data ?? []) as unknown as RequestRow[]).map(dbToRequest));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
    const onFocus = () => fetchRequests();
    const onVisible = () => { if (document.visibilityState === "visible") fetchRequests(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const t = setInterval(fetchRequests, REQUEST_POLL_MS);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(t);
    };
  }, [fetchRequests]);

  const issueFromRequest = useCallback(async (requestId: string, dueDate?: string) => {
    const res = await callRpc<{ id: string; due_date: string }>("issue_from_request", {
      p_request_id: requestId,
      p_due_date: dueDate || null,
    });
    if (res.success) {
      await fetchRequests();
      onChangeRef.current?.();
    }
    return res;
  }, [fetchRequests]);

  const rejectRequest = useCallback(async (requestId: string, reason: string) => {
    const res = await callRpc("reject_request", { p_request_id: requestId, p_reason: reason });
    if (res.success) {
      await fetchRequests();
      onChangeRef.current?.();
    }
    return res;
  }, [fetchRequests]);

  return { requests, loading, error, issueFromRequest, rejectRequest, refetch: fetchRequests };
}

/* ------------------------------------------------- Issue Book lookups */

export interface MemberOption {
  memberId: string;
  name: string;
  phone: string;
  status: string;
  activeLoans: number;
  activeHolds: number;
  overdueLoans: number;
  outstandingFines: number;
  defaultGuarantor: GuarantorDetails;
}

interface MemberSummaryRow {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  active_loans: number;
  active_holds: number;
  overdue_loans: number;
  outstanding_fines: number | string;
  default_guarantor_name: string | null;
  default_guarantor_relationship: string | null;
  default_guarantor_phone: string | null;
  default_guarantor_nid: string | null;
  default_guarantor_street: string | null;
  default_guarantor_city: string | null;
  default_guarantor_district: string | null;
  default_guarantor_postal_code: string | null;
}

/** Member search for Issue Book, straight from `member_summary_v` (live loan/hold/fine counts). */
export async function searchMembers(q: string): Promise<MemberOption[]> {
  let query = supabase
    .from("member_summary_v")
    .select(
      "id, name, phone, status, active_loans, active_holds, overdue_loans, outstanding_fines, default_guarantor_name, default_guarantor_relationship, default_guarantor_phone, default_guarantor_nid, default_guarantor_street, default_guarantor_city, default_guarantor_district, default_guarantor_postal_code",
    )
    .is("archived_at", null);
  const s = q.replace(/[,()"*%\\]/g, " ").trim();
  if (s) query = query.or(`name.ilike.*${s}*,id.ilike.*${s}*,phone.ilike.*${s}*,email.ilike.*${s}*`);
  const { data, error } = await query.order("name").limit(30);
  if (error) throw new Error(describeError(error).message);
  return ((data ?? []) as unknown as MemberSummaryRow[]).map((m) => ({
    memberId: m.id,
    name: m.name,
    phone: m.phone ?? "",
    status: m.status,
    activeLoans: m.active_loans,
    activeHolds: m.active_holds,
    overdueLoans: m.overdue_loans,
    outstandingFines: Number(m.outstanding_fines ?? 0),
    defaultGuarantor: {
      name: m.default_guarantor_name ?? "",
      relationship: m.default_guarantor_relationship ?? "",
      phone: m.default_guarantor_phone ?? "",
      email: "",
      nid: m.default_guarantor_nid ?? "",
      street: m.default_guarantor_street ?? "",
      city: m.default_guarantor_city ?? "",
      district: m.default_guarantor_district ?? "",
      postalCode: m.default_guarantor_postal_code ?? "",
    },
  }));
}

export interface BookOption {
  id: string;
  title: string;
  titleBangla: string;
  author: string;
  availableCopies: number;
  isCirculating: boolean;
}

/** Book search for Issue Book via the ranked, Bangla-aware `search_books` RPC. */
export async function searchBooksForLoan(q: string): Promise<BookOption[]> {
  const res = await callRpc<{
    id: string; title: string; title_bangla: string | null; author: string | null;
    available_copies: number; is_circulating: boolean;
  }[]>("search_books", { q: q.trim() || null, page: 1, page_size: 40 });
  if (!res.success) throw new Error(res.error);
  return res.data.map((b) => ({
    id: b.id,
    title: b.title,
    titleBangla: b.title_bangla ?? "",
    author: b.author ?? "",
    availableCopies: b.available_copies,
    isCirculating: b.is_circulating,
  }));
}

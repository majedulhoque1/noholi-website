import { useCallback, useEffect, useRef, useState } from "react";
import { describeError, supabase } from "./supabase";
import { useApp } from "./store";
import { formatDhaka } from "./dhaka-date";
import type { TKey } from "./i18n";

// Borrow requests, loans and fines for the signed-in member (supabase/CONTRACT.md sections 2-4).
// Everything here uses the browser `supabase` client, so call it from effects and event handlers
// only (member pages render in the browser). Own rows are enforced by RLS; every function throws
// the raw PostgREST error, so callers show describeError(err).

// ---------------------------------------------------------------------------------- types

export type PublicSettings = {
  loan_days: number;
  max_items: number;
  fine_per_day: number;
  hold_grace_days: number;
  pickup_window_days: number;
  renewals_allowed: number;
  renewal_days: number;
  closed_weekdays: number[];
  timezone: string;
  /** Today in Asia/Dhaka, 'YYYY-MM-DD'. */
  today: string;
};

export type BookLite = {
  id: string;
  title: string;
  title_bangla: string | null;
  author: string;
  author_bangla: string | null;
  genre: string | null;
  category: string | null;
  language: string | null;
  publisher: string | null;
  year_of_publication: string | null;
  edition: string | null;
  isbn: string | null;
  pages: number | null;
  condition: string | null;
  thumbnail: string | null;
  is_circulating: boolean;
  total_copies: number;
  available_copies: number;
};

export type RequestStatus = "Pending" | "Issued" | "Rejected" | "Expired" | "Cancelled";
export type LoanState = "Active" | "Overdue" | "Returned" | "Cancelled" | "Lost";
export type FineStatus = "Unpaid" | "Partially Paid" | "Paid" | "Waived" | "Voided";

export type GuarantorSnapshot = {
  guarantor_name: string | null;
  guarantor_relationship: string | null;
  guarantor_phone: string | null;
  guarantor_email: string | null;
  guarantor_nid: string | null;
  guarantor_street: string | null;
  guarantor_city: string | null;
  guarantor_district: string | null;
  guarantor_postal_code: string | null;
};

export type RequestRow = GuarantorSnapshot & {
  id: string;
  member_id: string;
  member_name: string;
  book_id: string;
  book_title: string;
  member_nid: string | null;
  guarantor_consent: boolean;
  pickup_date: string;
  /** Last day the hold is valid ('YYYY-MM-DD'). */
  expires_at: string;
  note: string | null;
  status: RequestStatus;
  loan_id: string | null;
  reason: string | null;
  created_at: string;
  decided_at: string | null;
};

export type LoanRow = GuarantorSnapshot & {
  id: string;
  book_id: string;
  book_title: string;
  member_id: string;
  issued_date: string;
  due_date: string;
  return_date: string | null;
  status: "Active" | "Returned" | "Cancelled" | "Lost";
  derived_status: LoanState;
  days_overdue: number;
  fine_amount: number;
  fine_is_accruing: boolean;
  fine_id: string | null;
  fine_status: FineStatus | null;
  fine_paid: number | null;
  fine_balance: number | null;
  renewal_count: number;
  request_id: string | null;
  notes: string | null;
  closed_at: string | null;
  created_at: string;
};

export type FineRow = {
  id: string;
  loan_id: string;
  member_id: string;
  kind: "Overdue" | "Lost";
  days_overdue: number | null;
  amount: number;
  amount_paid: number;
  status: FineStatus;
  created_at: string;
  updated_at: string;
};

export type FinePayment = {
  id: string;
  fine_id: string;
  amount: number;
  method: string;
  /** Receipt / reference recorded by the desk, if any. */
  reference: string | null;
  note: string | null;
  paid_at: string;
};

export type FineWaiver = { amount_waived: number; reason: string; waived_at: string };

type LoanLite = Pick<
  LoanRow,
  "id" | "book_id" | "book_title" | "issued_date" | "due_date" | "return_date" | "status"
>;

export type RequestWithBook = RequestRow & { book: BookLite | null };
export type LoanWithBook = LoanRow & { book: BookLite | null };
export type FineWithLoan = FineRow & { loan: LoanLite | null; book: BookLite | null };

export type BorrowRecord = {
  request: RequestRow | null;
  loan: LoanRow | null;
  fine: FineRow | null;
  book: BookLite | null;
};

export type FineDetail = {
  fine: FineRow;
  loan: LoanLite | null;
  book: BookLite | null;
  payments: FinePayment[];
  waiver: FineWaiver | null;
};

export type SubmitBorrowArgs = {
  bookId: string;
  pickupDate: string;
  memberNid: string;
  /** Optional note to the circulation desk (trimmed; omitted when empty). */
  note?: string;
  guarantor: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    nid: string;
    street: string;
    city: string;
    district: string;
    postalCode: string;
  };
};

// ------------------------------------------------------------------------------- helpers

const BOOK_COLUMNS =
  "id,title,title_bangla,author,author_bangla,genre,category,language,publisher,year_of_publication,edition,isbn,pages,condition,thumbnail,is_circulating,total_copies,available_copies";

const nz = (v: string | null | undefined) => {
  const s = (v ?? "").trim();
  return s ? s : null;
};

/** Unwraps a PostgREST result, throwing its error. */
function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

/** Public URL of a cover file in the `covers` bucket. */
export function coverUrl(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) return null;
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  return base ? `${base}/storage/v1/object/public/covers/${thumbnail}` : null;
}

/** Deterministic 0-7 colour tone for the drawn cover (`--cover-N`) from a book id. */
export function toneOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h % 8;
}

export const bookTitleOf = (b: BookLite | null, lang: string, fallback = "") =>
  b ? (lang === "bn" && b.title_bangla ? b.title_bangla : b.title) : fallback;
export const bookAuthorOf = (b: BookLite | null, lang: string) =>
  b ? (lang === "bn" && b.author_bangla ? b.author_bangla : b.author) : "";

/** Balance still to pay: only Unpaid / Partially Paid fines owe anything. */
export const fineBalance = (f: Pick<FineRow, "status" | "amount" | "amount_paid">) =>
  f.status === "Unpaid" || f.status === "Partially Paid"
    ? Math.max(0, Number(f.amount) - Number(f.amount_paid))
    : 0;

export type BadgeTone = "ok" | "bad" | "pending" | "muted";
type StatusView = { key: TKey; tone: BadgeTone };

const REQUEST_STATUS: Record<RequestStatus, StatusView> = {
  Pending: { key: "lending.st.onHold", tone: "pending" },
  Issued: { key: "lending.st.issued", tone: "ok" },
  Rejected: { key: "lending.st.rejected", tone: "bad" },
  Expired: { key: "lending.st.expired", tone: "muted" },
  Cancelled: { key: "lending.st.cancelled", tone: "muted" },
};
const LOAN_STATUS: Record<LoanState, StatusView> = {
  Active: { key: "lending.st.active", tone: "ok" },
  Overdue: { key: "lending.st.overdue", tone: "bad" },
  Returned: { key: "lending.st.returned", tone: "muted" },
  Lost: { key: "lending.st.lost", tone: "bad" },
  Cancelled: { key: "lending.st.cancelled", tone: "muted" },
};
const FINE_STATUS: Record<FineStatus, StatusView> = {
  Unpaid: { key: "lending.st.unpaid", tone: "bad" },
  "Partially Paid": { key: "lending.st.partlyPaid", tone: "bad" },
  Paid: { key: "lending.st.paid", tone: "muted" },
  Waived: { key: "lending.st.waived", tone: "muted" },
  Voided: { key: "lending.st.voided", tone: "muted" },
};

/** Pending holds are shown as "On hold"; everything else maps 1:1. */
export const requestStatusView = (s: RequestStatus): StatusView => REQUEST_STATUS[s];
export const loanStatusView = (s: LoanState): StatusView => LOAN_STATUS[s];
export const fineStatusView = (s: FineStatus): StatusView => FINE_STATUS[s];

/** Last four characters of an ID number; never the whole thing. */
export const last4 = (nid: string | null | undefined) => {
  const s = (nid ?? "").replace(/\s/g, "");
  return s ? s.slice(-4) : undefined;
};

// -------------------------------------------------------------------------------- queries

export async function publicSettings(): Promise<PublicSettings> {
  return must(await supabase.rpc("get_public_settings")) as PublicSettings;
}

export async function fetchBook(id: string): Promise<BookLite | null> {
  const res = await supabase.from("books").select(BOOK_COLUMNS).eq("id", id).maybeSingle();
  return must(res) as BookLite | null;
}

/** One query for every book on a list (no N+1). */
export async function fetchBooksByIds(ids: string[]): Promise<Record<string, BookLite>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const rows = must(await supabase.from("books").select(BOOK_COLUMNS).in("id", unique)) as
    BookLite[] | null;
  return Object.fromEntries((rows ?? []).map((b) => [b.id, b]));
}

export async function myLoans(): Promise<LoanWithBook[]> {
  const rows = (must(
    await supabase.from("loan_status_v").select("*").order("created_at", { ascending: false }),
  ) ?? []) as LoanRow[];
  const books = await fetchBooksByIds(rows.map((l) => l.book_id));
  return rows.map((l) => ({ ...l, book: books[l.book_id] ?? null }));
}

/** Loans that are past due now (accruing a fine). */
export async function myOverdueLoans(): Promise<LoanRow[]> {
  return (must(
    await supabase
      .from("loan_status_v")
      .select("*")
      .eq("derived_status", "Overdue")
      .order("due_date", { ascending: true }),
  ) ?? []) as LoanRow[];
}

export async function myRequests(): Promise<RequestWithBook[]> {
  const rows = (must(
    await supabase.from("borrow_requests").select("*").order("created_at", { ascending: false }),
  ) ?? []) as RequestRow[];
  const books = await fetchBooksByIds(rows.map((r) => r.book_id));
  return rows.map((r) => ({ ...r, book: books[r.book_id] ?? null }));
}

/** A request or a loan (`REQ-` / `LN-` id) with its loan, fine and book; null when it isn't yours. */
export async function myBorrowRecord(id: string): Promise<BorrowRecord | null> {
  let request: RequestRow | null = null;
  let loan: LoanRow | null = null;
  if (/^LN-/i.test(id)) {
    loan = must(
      await supabase.from("loan_status_v").select("*").eq("id", id).maybeSingle(),
    ) as LoanRow | null;
    if (!loan) return null;
    if (loan.request_id) {
      request = must(
        await supabase.from("borrow_requests").select("*").eq("id", loan.request_id).maybeSingle(),
      ) as RequestRow | null;
    }
  } else {
    request = must(
      await supabase.from("borrow_requests").select("*").eq("id", id).maybeSingle(),
    ) as RequestRow | null;
    if (!request) return null;
    if (request.loan_id) {
      loan = must(
        await supabase.from("loan_status_v").select("*").eq("id", request.loan_id).maybeSingle(),
      ) as LoanRow | null;
    }
  }
  const fine = loan?.fine_id
    ? (must(
        await supabase.from("fines").select("*").eq("id", loan.fine_id).maybeSingle(),
      ) as FineRow | null)
    : null;
  const bookId = request?.book_id ?? loan?.book_id;
  const book = bookId ? await fetchBook(bookId) : null;
  return { request, loan, fine, book };
}

const LOAN_LITE = "id,book_id,book_title,issued_date,due_date,return_date,status";

export async function myFines(): Promise<FineWithLoan[]> {
  const fines = (must(
    await supabase.from("fines").select("*").order("created_at", { ascending: false }),
  ) ?? []) as FineRow[];
  if (!fines.length) return [];
  const loans = (must(
    await supabase
      .from("loans")
      .select(LOAN_LITE)
      .in(
        "id",
        fines.map((f) => f.loan_id),
      ),
  ) ?? []) as LoanLite[];
  const loanById = Object.fromEntries(loans.map((l) => [l.id, l]));
  const books = await fetchBooksByIds(loans.map((l) => l.book_id));
  return fines.map((f) => {
    const loan = loanById[f.loan_id] ?? null;
    return { ...f, loan, book: loan ? (books[loan.book_id] ?? null) : null };
  });
}

export async function myFine(id: string): Promise<FineDetail | null> {
  const fine = must(
    await supabase.from("fines").select("*").eq("id", id).maybeSingle(),
  ) as FineRow | null;
  if (!fine) return null;
  const [loanRes, payRes, waiverRes] = await Promise.all([
    supabase.from("loans").select(LOAN_LITE).eq("id", fine.loan_id).maybeSingle(),
    supabase
      .from("fine_payments")
      .select("id,fine_id,amount,method,reference,note,paid_at")
      .eq("fine_id", id)
      .order("paid_at", { ascending: true }),
    supabase
      .from("fine_waivers")
      .select("amount_waived,reason,waived_at")
      .eq("fine_id", id)
      .maybeSingle(),
  ]);
  const loan = must(loanRes) as LoanLite | null;
  const payments = (must(payRes) ?? []) as FinePayment[];
  const waiver = must(waiverRes) as FineWaiver | null;
  const book = loan ? await fetchBook(loan.book_id) : null;
  return { fine, loan, book, payments, waiver };
}

// ---------------------------------------------------------------------------------- RPCs

export async function cancelRequest(requestId: string): Promise<RequestRow> {
  return must(await supabase.rpc("cancel_my_request", { p_request_id: requestId })) as RequestRow;
}

export async function renewLoan(loanId: string): Promise<LoanRow> {
  return must(await supabase.rpc("renew_my_loan", { p_loan_id: loanId })) as LoanRow;
}

export async function submitBorrowRequest(a: SubmitBorrowArgs): Promise<RequestRow> {
  const g = a.guarantor;
  return must(
    await supabase.rpc("submit_borrow_request", {
      p_book_id: a.bookId,
      p_pickup_date: a.pickupDate,
      p_consent: true,
      p_member_nid: a.memberNid.trim(),
      p_guarantor_name: g.name.trim(),
      p_guarantor_relationship: nz(g.relationship),
      p_guarantor_phone: g.phone.trim(),
      p_guarantor_email: nz(g.email),
      p_guarantor_nid: nz(g.nid),
      p_guarantor_street: nz(g.street),
      p_guarantor_city: nz(g.city),
      p_guarantor_district: nz(g.district),
      p_guarantor_postal_code: nz(g.postalCode),
      p_note: nz(a.note),
    }),
  ) as RequestRow;
}

/** The RPC error code (NH005 ...) when the error came from the database, else null. */
export const errorCode = (err: unknown): string | null =>
  err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : null;

// ---------------------------------------------------------------------------------- hooks

export type Loaded<T> = {
  data: T | null;
  /** Reader-facing message when the fetch failed (never confuse with an empty result). */
  error: string | null;
  loading: boolean;
  reload: () => void;
  /** Re-fetch without flipping back to the loading skeleton. */
  refresh: () => Promise<void>;
};

/**
 * Runs `fn` on mount (and whenever `deps` change) and exposes loading / error / data.
 * `enabled = false` keeps it idle (e.g. until the member id is known).
 */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[], enabled = true): Loaded<T> {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });
  const run = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const exec = useCallback(async (silent: boolean) => {
    const mine = ++run.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (mine === run.current) setState({ data, error: null, loading: false });
    } catch (err) {
      console.error(err);
      if (mine === run.current)
        setState((s) => ({
          data: silent ? s.data : null,
          error: describeError(err),
          loading: false,
        }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void exec(false);
    return () => {
      run.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, exec, ...deps]);

  return {
    ...state,
    loading: enabled ? state.loading : true,
    reload: () => void exec(false),
    refresh: () => exec(true),
  };
}

/** Dhaka-time date and money formatters in the active language. */
export function useFmt() {
  const { lang } = useApp();
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  return {
    locale,
    /** '12 Oct 2026' */
    date: (v: string | null | undefined) =>
      v ? formatDhaka(v, { locale, day: "numeric", month: "short", year: "numeric" }) : "—",
    /** 'Monday, 12 October 2026' */
    dateLong: (v: string | null | undefined) =>
      v
        ? formatDhaka(v, {
            locale,
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "—",
    /** '12 Oct 2026, 14:05' (Dhaka time) */
    dateTime: (v: string | null | undefined) =>
      v
        ? formatDhaka(v, {
            locale,
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          })
        : "—",
    /** '৳60' / '৳12.5' */
    taka: (n: number | string | null | undefined) =>
      `৳${Number(n ?? 0).toLocaleString(locale === "bn-BD" ? "bn-BD" : "en-US", { maximumFractionDigits: 2 })}`,
  };
}

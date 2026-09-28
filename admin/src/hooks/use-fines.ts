import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { describeError } from "@/lib/rpc";
import { callRpc, type Outcome } from "./use-inventory";

/* ------------------------------------------------------------------
 * Fines come from three tables: `fines` (one per closed late/lost loan),
 * `fine_payments` (many, partial allowed) and `fine_waivers` (admin).
 * Active overdue loans have no fine row yet: their running amount comes
 * from `loan_status_v` and is shown as "Accruing" (not payable).
 * Writes: record_fine_payment (idempotent) and waive_fine (admin + MFA).
 * ------------------------------------------------------------------ */

export type FineStatus = "Unpaid" | "Partially Paid" | "Paid" | "Waived" | "Voided" | "Accruing";
export const PAYMENT_METHODS = ["Cash", "bKash", "Nagad", "Bank Transfer", "Card", "Other"] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface FinePaymentRecord {
  id: string;
  amount: number;
  method: string;
  reference: string;
  note: string;
  paidAt: string;
}

/** Summary kept for older consumers: total paid + the latest payment's details. */
export interface FinePayment {
  amountPaid: number;
  method: string;
  reference: string;
  paidDate: string;
  note: string;
}

export interface FineWaiver {
  reason: string;
  amountWaived: number;
  waivedDate: string;
}

export interface Fine {
  /** `FN-0001`, or the loan id for an accruing (not yet created) fine. */
  id: string;
  loanId: string;
  member: string;
  memberId: string;
  book: string;
  bookId: string;
  accessionId: string;
  dueDate: string;
  returnDate: string | null;
  kind: "Overdue" | "Lost";
  daysOverdue: number;
  amount: number;
  amountPaid: number;
  /** What is still owed (0 unless Unpaid / Partially Paid). */
  balance: number;
  status: FineStatus;
  isAccruing: boolean;
  createdDate: string;
  payments: FinePaymentRecord[];
  payment?: FinePayment;
  waiver?: FineWaiver;
}

interface FineRow {
  id: string;
  loan_id: string;
  member_id: string;
  kind: "Overdue" | "Lost";
  days_overdue: number | null;
  amount: number | string;
  amount_paid: number | string;
  status: Exclude<FineStatus, "Accruing">;
  created_at: string;
  loans: {
    book_id: string; book_title: string; accession_id: string | null; member_name: string;
    due_date: string; return_date: string | null;
  } | null;
  fine_payments: { id: string; amount: number | string; method: string; reference: string | null; note: string | null; paid_at: string }[] | null;
  fine_waivers:
    | { amount_waived: number | string; reason: string; waived_at: string }
    | { amount_waived: number | string; reason: string; waived_at: string }[]
    | null;
}

interface AccruingRow {
  id: string; book_id: string; book_title: string; accession_id: string | null; member_id: string; member_name: string;
  due_date: string; issued_date: string; days_overdue: number; fine_amount: number | string;
}

function dbToFine(r: FineRow): Fine {
  const amount = Number(r.amount);
  const amountPaid = Number(r.amount_paid);
  const payments = (r.fine_payments ?? [])
    .map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      reference: p.reference ?? "",
      note: p.note ?? "",
      paidAt: p.paid_at,
    }))
    .sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  const last = payments[payments.length - 1];
  const w = Array.isArray(r.fine_waivers) ? r.fine_waivers[0] : r.fine_waivers;
  return {
    id: r.id,
    loanId: r.loan_id,
    member: r.loans?.member_name ?? r.member_id,
    memberId: r.member_id,
    book: r.loans?.book_title ?? "",
    bookId: r.loans?.book_id ?? "",
    accessionId: r.loans?.accession_id ?? r.loans?.book_id ?? "",
    dueDate: r.loans?.due_date ?? "",
    returnDate: r.loans?.return_date ?? null,
    kind: r.kind,
    daysOverdue: r.days_overdue ?? 0,
    amount,
    amountPaid,
    balance: r.status === "Unpaid" || r.status === "Partially Paid" ? Math.max(0, amount - amountPaid) : 0,
    status: r.status,
    isAccruing: false,
    createdDate: r.created_at,
    payments,
    payment: last
      ? { amountPaid, method: last.method, reference: last.reference, paidDate: last.paidAt, note: last.note }
      : undefined,
    waiver: w ? { reason: w.reason, amountWaived: Number(w.amount_waived), waivedDate: w.waived_at } : undefined,
  };
}

function accruingToFine(r: AccruingRow): Fine {
  const amount = Number(r.fine_amount);
  return {
    id: r.id,
    loanId: r.id,
    member: r.member_name,
    memberId: r.member_id,
    book: r.book_title,
    bookId: r.book_id,
    accessionId: r.accession_id ?? r.book_id,
    dueDate: r.due_date,
    returnDate: null,
    kind: "Overdue",
    daysOverdue: r.days_overdue,
    amount,
    amountPaid: 0,
    balance: 0,
    status: "Accruing",
    isAccruing: true,
    createdDate: r.due_date,
    payments: [],
  };
}

async function fetchFines(): Promise<Fine[]> {
  const PAGE = 1000;
  const out: Fine[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("fines")
      .select(
        "id, loan_id, member_id, kind, days_overdue, amount, amount_paid, status, created_at, " +
          "loans(book_id, book_title, accession_id, member_name, due_date, return_date), " +
          "fine_payments(id, amount, method, reference, note, paid_at), " +
          "fine_waivers(amount_waived, reason, waived_at)",
      )
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(describeError(error).message);
    const rows = (data ?? []) as unknown as FineRow[];
    out.push(...rows.map(dbToFine));
    if (rows.length < PAGE) break;
  }

  const { data: acc, error: accErr } = await supabase
    .from("loan_status_v")
    .select("id, book_id, book_title, accession_id, member_id, member_name, due_date, issued_date, days_overdue, fine_amount")
    .eq("derived_status", "Overdue")
    .gt("fine_amount", 0)
    .order("due_date", { ascending: true });
  if (accErr) throw new Error(describeError(accErr).message);
  return [...((acc ?? []) as unknown as AccruingRow[]).map(accruingToFine), ...out];
}

export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  reference: string;
  note: string;
  /** One uuid per dialog open (crypto.randomUUID()); reused on retry so a double click can't double-charge. */
  idempotencyKey: string;
}

export function useFines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setFines(await fetchFines());
      setError(null);
    } catch (e) {
      setError(describeError(e).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const recordPayment = useCallback(
    async (fineId: string, p: RecordPaymentInput): Promise<Outcome<{ duplicate: boolean; status: string }>> => {
      const res = await callRpc<{ duplicate: boolean; fine: { status: string } }>("record_fine_payment", {
        p_fine_id: fineId,
        p_amount: p.amount,
        p_method: p.method,
        p_idempotency_key: p.idempotencyKey,
        p_reference: p.reference || null,
        p_note: p.note || null,
      });
      if (!res.success) return { success: false, error: res.error, code: res.code };
      await refetch();
      return { success: true, data: { duplicate: !!res.data.duplicate, status: res.data.fine?.status ?? "" } };
    },
    [refetch],
  );

  const waiveFine = useCallback(
    async (fineId: string, reason: string): Promise<Outcome> => {
      const res = await callRpc("waive_fine", { p_fine_id: fineId, p_reason: reason });
      if (!res.success) return { success: false, error: res.error, code: res.code };
      await refetch();
      return { success: true, data: undefined };
    },
    [refetch],
  );

  const totals = useMemo(() => {
    let outstanding = 0, collected = 0, waived = 0, accruing = 0;
    for (const f of fines) {
      if (f.isAccruing) accruing += f.amount;
      else {
        outstanding += f.balance;
        collected += f.amountPaid;
        if (f.waiver) waived += f.waiver.amountWaived;
      }
    }
    return {
      outstanding,
      collected,
      waived,
      accruing,
      count: fines.length,
      // Legacy aliases
      unpaid: outstanding,
      paid: collected,
    };
  }, [fines]);

  return { fines, loading, error, totals, recordPayment, waiveFine, refetch };
}

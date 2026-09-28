import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { describeError } from "@/lib/rpc";

export interface HistLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  issuedDate: string;
  dueDate: string;
  returnDate: string | null;
  derivedStatus: "Active" | "Overdue" | "Returned" | "Cancelled" | "Lost";
  daysOverdue: number;
  fineAmount: number;
  fineIsAccruing: boolean;
  fineStatus: string | null;
  renewalCount: number;
}

export interface HistRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  pickupDate: string;
  expiresAt: string;
  status: string;
  reason: string | null;
  loanId: string | null;
  createdAt: string;
}

export interface HistPayment {
  id: string;
  fineId: string;
  amount: number;
  method: string;
  reference: string | null;
  paidAt: string;
}

export interface HistFine {
  id: string;
  loanId: string;
  kind: string;
  daysOverdue: number;
  amount: number;
  amountPaid: number;
  status: string;
  createdAt: string;
  payments: HistPayment[];
  waiver: { amount: number; reason: string; waivedAt: string } | null;
}

export interface MemberHistory {
  loans: HistLoan[];
  requests: HistRequest[];
  fines: HistFine[];
}

const n = (v: unknown) => Number(v) || 0;

/** Loans, web requests, fines, payments and waivers for one member, read straight from the tables/views. */
export function useMemberHistory(memberId: string | null) {
  const [history, setHistory] = useState<MemberHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [loansQ, reqQ, finesQ] = await Promise.all([
        supabase.from("loan_status_v").select("*").eq("member_id", id).order("issued_date", { ascending: false }),
        supabase.from("borrow_requests").select("*").eq("member_id", id).order("created_at", { ascending: false }),
        supabase.from("fines").select("*").eq("member_id", id).order("created_at", { ascending: false }),
      ]);
      const firstErr = loansQ.error || reqQ.error || finesQ.error;
      if (firstErr) throw firstErr;
      const fineIds = (finesQ.data ?? []).map((f) => f.id as string);
      const [payQ, waiveQ] = fineIds.length
        ? await Promise.all([
            supabase.from("fine_payments").select("*").in("fine_id", fineIds).order("paid_at"),
            supabase.from("fine_waivers").select("*").in("fine_id", fineIds),
          ])
        : [{ data: [], error: null }, { data: [], error: null }];
      if (payQ.error || waiveQ.error) throw payQ.error || waiveQ.error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loans: HistLoan[] = (loansQ.data ?? []).map((l: any) => ({
        id: l.id, bookId: l.book_id ?? l.accession_id ?? "", bookTitle: l.book_title ?? "",
        issuedDate: l.issued_date, dueDate: l.due_date, returnDate: l.return_date,
        derivedStatus: l.derived_status, daysOverdue: n(l.days_overdue), fineAmount: n(l.fine_amount),
        fineIsAccruing: !!l.fine_is_accruing, fineStatus: l.fine_status ?? null, renewalCount: n(l.renewal_count),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requests: HistRequest[] = (reqQ.data ?? []).map((r: any) => ({
        id: r.id, bookId: r.book_id, bookTitle: r.book_title ?? "", pickupDate: r.pickup_date,
        expiresAt: r.expires_at, status: r.status, reason: r.reason ?? null, loanId: r.loan_id ?? null,
        createdAt: r.created_at,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payments = (payQ.data ?? []) as any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const waivers = (waiveQ.data ?? []) as any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fines: HistFine[] = (finesQ.data ?? []).map((f: any) => {
        const w = waivers.find((x) => x.fine_id === f.id);
        return {
          id: f.id, loanId: f.loan_id, kind: f.kind, daysOverdue: n(f.days_overdue), amount: n(f.amount),
          amountPaid: n(f.amount_paid), status: f.status, createdAt: f.created_at,
          payments: payments.filter((p) => p.fine_id === f.id).map((p) => ({
            id: p.id, fineId: p.fine_id, amount: n(p.amount), method: p.method, reference: p.reference ?? null, paidAt: p.paid_at,
          })),
          waiver: w ? { amount: n(w.amount_waived), reason: w.reason, waivedAt: w.waived_at } : null,
        };
      });
      setHistory({ loans, requests, fines });
    } catch (e) {
      setError(describeError(e).message);
      setHistory(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (memberId) load(memberId);
    else setHistory(null);
  }, [memberId, load]);

  return { history, loading, error, reload: () => (memberId ? load(memberId) : Promise.resolve()) };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { callRpc, describeError } from "@/lib/rpc";

export type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Added to Inventory";

export interface Donation {
  id: string;
  donorName: string;
  donorContact: string;
  bookTitle: string;
  bookAuthor: string;
  condition: "New" | "Good" | "Fair" | "Poor";
  dateReceived: string;
  notes: string;
  reviewStatus: ReviewStatus;
  rejectionReason: string;
  assignedAccessionId?: string;
}

export interface DonationInput {
  donorName: string;
  donorContact: string;
  bookTitle: string;
  bookAuthor: string;
  condition: Donation["condition"];
  dateReceived: string;
  notes: string;
}

type DonationRow = { [column: string]: string | null };

function dbToDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    donorName: row.donor_name,
    donorContact: row.donor_contact ?? "",
    bookTitle: row.book_title,
    bookAuthor: row.book_author ?? "",
    condition: row.condition as Donation["condition"],
    dateReceived: row.date_received,
    notes: row.notes ?? "",
    reviewStatus: row.review_status as ReviewStatus,
    rejectionReason: row.rejection_reason ?? "",
    assignedAccessionId: row.assigned_accession_id || undefined,
  };
}

function inputToDb(d: DonationInput) {
  return {
    donor_name: d.donorName,
    donor_contact: d.donorContact,
    book_title: d.bookTitle,
    book_author: d.bookAuthor,
    condition: d.condition,
    date_received: d.dateReceived,
    notes: d.notes,
  };
}

/** Supabase/PostgREST error → Error with the readable message (NH0xx messages are shown as-is). */
const toError = (err: unknown) => new Error(describeError(err).message);

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const replace = (row: DonationRow) => {
    const d = dbToDonation(row);
    setDonations((prev) => prev.map((x) => (x.id === d.id ? d : x)));
    return d;
  };

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
    if (error) throw toError(error);
    setDonations((data ?? []).map(dbToDonation));
  }, []);

  useEffect(() => {
    reload().catch((err) => console.error("Failed to load donations:", err)).finally(() => setLoading(false));
  }, [reload]);

  const addDonation = useCallback(async (input: DonationInput) => {
    // The database assigns the DON-### id and starts the row as Pending.
    const { data, error } = await supabase
      .from("donations")
      .insert(inputToDb(input))
      .select()
      .single();
    if (error) throw toError(error);
    const d = dbToDonation(data);
    setDonations((prev) => [d, ...prev]);
    return d.id;
  }, []);

  const updateDonation = useCallback(async (id: string, input: DonationInput) => {
    const { data, error } = await supabase
      .from("donations").update(inputToDb(input)).eq("id", id).eq("review_status", "Pending").select().maybeSingle();
    if (error) throw toError(error);
    if (!data) throw new Error("Only Pending donations can be edited.");
    return replace(data);
  }, []);

  const approve = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("donations").update({ review_status: "Approved" }).eq("id", id).eq("review_status", "Pending").select().maybeSingle();
    if (error) throw toError(error);
    if (!data) throw new Error("Only Pending donations can be approved.");
    return replace(data);
  }, []);

  const reject = useCallback(async (id: string, reason: string) => {
    const r = reason.trim();
    if (!r) throw new Error("A rejection reason is required.");
    const { data, error } = await supabase
      .from("donations").update({ review_status: "Rejected", rejection_reason: r }).eq("id", id).eq("review_status", "Pending").select().maybeSingle();
    if (error) throw toError(error);
    if (!data) throw new Error("Only Pending donations can be rejected.");
    return replace(data);
  }, []);

  /** Atomically creates one Inventory book and links it. Safe against double submission. */
  const addToInventory = useCallback(async (id: string) => {
    const r = await callRpc<string>("add_donation_to_inventory", { _donation_id: id });
    if (r.success === false) {
      await reload().catch(() => {});
      throw new Error(r.error);
    }
    const bookId = r.data;
    const { data } = await supabase.from("donations").select("*").eq("id", id).single();
    if (data) replace(data);
    return bookId;
  }, [reload]);

  const deleteDonation = useCallback(async (id: string) => {
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) throw toError(error);
    setDonations((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { donations, loading, reload, addDonation, updateDonation, approve, reject, addToInventory, deleteDonation };
}

import { supabase } from "./supabase";
import type {
  Contribution,
  ContributionStatus,
  RecordEvent,
  Recommendation,
  RecStatus,
} from "./data";

// Member wishlist, recommendations, contributions and book reviews, backed by
// supabase/migrations/20261014000100_member_collections.sql. Reads go through RLS (own rows
// only); every write is an RPC.

type Event = { label: string; at: string; note?: string };
const events = (raw: unknown): RecordEvent[] =>
  Array.isArray(raw)
    ? (raw as Event[]).map((e) => ({ date: e.at, label: e.label, note: e.note }))
    : [];
const day = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);

// ---------------------------------------------------------------- wishlist
export async function loadWishlist(): Promise<string[]> {
  const { data, error } = await supabase
    .from("member_wishlist")
    .select("item_id")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => r.item_id as string);
}

/** Resolves to true when the item is now on the wishlist. */
export async function toggleWishlistItem(itemId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("toggle_wishlist", { p_item_id: itemId });
  if (error) throw error;
  return data === true;
}

// ---------------------------------------------------------- recommendations
type RecRow = {
  id: string;
  format: Recommendation["format"];
  title: string;
  author: string;
  language: Recommendation["language"];
  reason: string;
  publisher: string | null;
  isbn: string | null;
  year: string | null;
  edition: string | null;
  genre: string | null;
  category: string | null;
  narrator: string | null;
  source: string | null;
  notes: string | null;
  status: RecStatus;
  explanation: string | null;
  catalog_id: string | null;
  timeline: unknown;
  created_at: string;
  updated_at: string;
};

const rec = (r: RecRow): Recommendation => ({
  id: r.id,
  format: r.format,
  title: r.title,
  author: r.author,
  language: r.language,
  reason: r.reason,
  date: day(r.created_at),
  updated: day(r.updated_at),
  status: r.status,
  publisher: r.publisher ?? undefined,
  isbn: r.isbn ?? undefined,
  year: r.year ?? undefined,
  edition: r.edition ?? undefined,
  genre: r.genre ?? undefined,
  category: r.category ?? undefined,
  narrator: r.narrator ?? undefined,
  source: r.source ?? undefined,
  notes: r.notes ?? undefined,
  explanation: r.explanation ?? undefined,
  catalogId: r.catalog_id ?? undefined,
  timeline: events(r.timeline),
});

export async function loadRecommendations(): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from("book_recommendations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as RecRow[]).map(rec);
}

export async function sendRecommendation(
  r: Omit<Recommendation, "id" | "date" | "status" | "updated" | "timeline">,
): Promise<Recommendation> {
  const { data, error } = await supabase.rpc("submit_recommendation", { p: r });
  if (error) throw error;
  return rec(data as RecRow);
}

// ------------------------------------------------------------ contributions
type ConRow = {
  id: string;
  kind: Contribution["kind"];
  title: string;
  status: ContributionStatus;
  note: string | null;
  slug: string | null;
  book_id: string | null;
  book_title: string | null;
  book_source: string | null;
  rating: number | null;
  language: string | null;
  category: string | null;
  excerpt: string | null;
  tags: string[] | null;
  content: string | null;
  timeline: unknown;
  submitted_at: string | null;
  updated_at: string;
};

const con = (r: ConRow): Contribution => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  status: r.status,
  updated: day(r.updated_at),
  submitted: r.submitted_at ? day(r.submitted_at) : undefined,
  note: r.note ?? undefined,
  slug: r.slug ?? undefined,
  bookId: r.book_id ?? undefined,
  bookTitle: r.book_title ?? undefined,
  bookSource: r.book_source ?? undefined,
  rating: r.rating ?? undefined,
  language: r.language ?? undefined,
  category: r.category ?? undefined,
  excerpt: r.excerpt ?? undefined,
  tags: r.tags ?? undefined,
  content: r.content ?? undefined,
  timeline: events(r.timeline),
});

export async function loadContributions(): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from("member_contributions")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ConRow[]).map(con);
}

export type ContributionInput = {
  kind: Contribution["kind"];
  title: string;
  content?: string;
  excerpt?: string;
  language?: string;
  category?: string;
  tags?: string[];
  bookId?: string;
  bookTitle?: string;
  bookSource?: "catalog" | "personal";
  rating?: number;
};

export async function saveContributionRecord(
  c: ContributionInput,
  submit: boolean,
  id?: string,
): Promise<Contribution> {
  const { data, error } = await supabase.rpc("save_contribution", {
    p: {
      kind: c.kind,
      title: c.title,
      content: c.content,
      excerpt: c.excerpt,
      language: c.language,
      category: c.category,
      tags: c.tags ?? [],
      book_id: c.bookId,
      book_title: c.bookTitle,
      book_source: c.bookSource,
      rating: c.rating,
    },
    p_submit: submit,
    p_id: id ?? null,
  });
  if (error) throw error;
  return con(data as ConRow);
}

export async function deleteContributionRecord(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_my_contribution", { p_id: id });
  if (error) throw error;
}

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { callRpc as rawCallRpc, describeError } from "@/lib/rpc";

/**
 * Outcome of a write. Same shape as `Result` from lib/rpc, but with optional
 * fields so callers can read `error` without discriminated-union narrowing
 * (this project compiles with `strict: false`, where that narrowing is off).
 */
export type Outcome<T = void> = { success: boolean; data?: T; error?: string; code?: string };

/** `callRpc` from lib/rpc, returning an `Outcome`. */
export async function callRpc<T = unknown>(fn: string, args?: Record<string, unknown>): Promise<Outcome<T>> {
  return (await rawCallRpc<T>(fn, args)) as Outcome<T>;
}

/* ------------------------------------------------------------------
 * Inventory: one row per title in `books` with a copy count.
 * Reads are server-side paginated (3,000+ titles). Copy counts
 * (issued / reserved / available) are owned by the database: only the
 * lending RPCs and `adjust_stock` change them. See supabase/CONTRACT.md.
 * ------------------------------------------------------------------ */

export type BookStatus = "Available" | "Unavailable" | "Out of Stock";

export interface Book {
  id: string;
  title: string;
  titleBangla: string;
  author: string;
  authorBangla: string;
  genre: string;
  category: string;
  language: string;
  isbn: string;
  publisher: string;
  yearOfPublication: string;
  edition: string;
  condition: string;
  pages: number;
  /** null = no price recorded (fines then use settings.default_book_value). */
  price: number | null;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  reservedCopies: number;
  location: string;
  /** Path inside the public `covers` bucket (e.g. `BK-0001.webp`), or null. */
  thumbnail: string | null;
  /** Public URL built from `thumbnail`, ready for <img src>. */
  coverUrl?: string;
  isCirculating: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function deriveStatus(book: Pick<Book, "totalCopies" | "availableCopies">): BookStatus {
  if (book.totalCopies === 0) return "Out of Stock";
  if (book.availableCopies > 0) return "Available";
  return "Unavailable";
}

/**
 * Running low because of lending: some copies are out and at most 2 remain.
 * (Most titles have a single copy, so "≤ 2 available" alone would flag nearly the whole catalogue.)
 */
export function isLowStock(book: Pick<Book, "availableCopies" | "totalCopies">): boolean {
  return book.availableCopies > 0 && book.availableCopies <= 2 && book.availableCopies < book.totalCopies;
}

/** Public URL of a cover path. `version` busts the browser cache after a re-upload. */
export function coverUrl(path: string | null | undefined, version?: string): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:)/.test(path)) return path;
  const url = supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}

interface BookRow {
  id: string;
  title: string;
  title_bangla: string | null;
  author: string | null;
  author_bangla: string | null;
  genre: string | null;
  category: string | null;
  language: string | null;
  isbn: string | null;
  publisher: string | null;
  year_of_publication: string | null;
  edition: string | null;
  condition: string | null;
  pages: number | null;
  price: number | string | null;
  total_copies: number;
  available_copies: number;
  issued_copies: number;
  reserved_copies: number;
  location: string | null;
  thumbnail: string | null;
  is_circulating: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export function dbToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    titleBangla: row.title_bangla ?? "",
    author: row.author ?? "",
    authorBangla: row.author_bangla ?? "",
    genre: row.genre ?? "",
    category: row.category ?? "",
    language: row.language ?? "",
    isbn: row.isbn ?? "",
    publisher: row.publisher ?? "",
    yearOfPublication: row.year_of_publication ?? "",
    edition: row.edition ?? "",
    condition: row.condition ?? "",
    pages: row.pages ?? 0,
    price: row.price === null || row.price === undefined || row.price === "" ? null : Number(row.price),
    totalCopies: row.total_copies ?? 0,
    availableCopies: row.available_copies ?? 0,
    issuedCopies: row.issued_copies ?? 0,
    reservedCopies: row.reserved_copies ?? 0,
    location: row.location ?? "",
    thumbnail: row.thumbnail ?? null,
    coverUrl: coverUrl(row.thumbnail, row.updated_at),
    isCirculating: row.is_circulating ?? true,
    archivedAt: row.archived_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Editable metadata (everything staff may write directly; copy counts excluded). */
export interface BookMetadata {
  title: string;
  titleBangla: string;
  author: string;
  authorBangla: string;
  genre: string;
  category: string;
  language: string;
  isbn: string;
  publisher: string;
  yearOfPublication: string;
  edition: string;
  condition: string;
  pages: number;
  price: number | null;
  location: string;
  isCirculating: boolean;
}

export interface NewBookInput extends BookMetadata {
  totalCopies: number;
}

const blankToNull = (v: string) => (v.trim() === "" ? null : v.trim());

function metadataToDb(m: BookMetadata) {
  return {
    title: m.title.trim(),
    title_bangla: blankToNull(m.titleBangla),
    author: m.author.trim(),
    author_bangla: blankToNull(m.authorBangla),
    genre: blankToNull(m.genre),
    category: blankToNull(m.category),
    language: blankToNull(m.language),
    isbn: blankToNull(m.isbn),
    publisher: blankToNull(m.publisher),
    year_of_publication: blankToNull(m.yearOfPublication),
    edition: blankToNull(m.edition),
    condition: blankToNull(m.condition),
    pages: m.pages > 0 ? Math.round(m.pages) : null,
    price: m.price === null || Number.isNaN(m.price) ? null : m.price,
    location: blankToNull(m.location),
    is_circulating: m.isCirculating,
  };
}

/* ---------------------------------------------------------------- list */

export type InventoryFlag = "missing-price" | "missing-cover" | "non-circulating" | "archived";
export type StatusFilter = "All" | BookStatus;

export interface BookQuery {
  search: string;
  genre: string; // "All" = any
  category: string;
  language: string;
  status: StatusFilter;
  flags: InventoryFlag[];
  page: number; // 1-based
  pageSize: number;
}

/** Strips characters that would break a PostgREST `or=(…)` filter. */
function sanitizeForOr(q: string) {
  return q.replace(/[,()"*%\\]/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchBookPage(q: BookQuery): Promise<{ rows: Book[]; total: number }> {
  const term = q.search.trim();
  const onlySearch =
    term.length > 0 && q.status === "All" && q.flags.length === 0;

  // Plain search: use the ranked, Bangla-aware `search_books` RPC, then load the
  // full staff columns (price, location, archived…) for that page of ids.
  if (onlySearch) {
    const res = await callRpc<{ id: string; total_count: number }[]>("search_books", {
      q: term,
      genre: q.genre === "All" ? null : q.genre,
      category: q.category === "All" ? null : q.category,
      language: q.language === "All" ? null : q.language,
      page: q.page,
      page_size: q.pageSize,
    });
    if (!res.success) throw new Error(res.error);
    const ids = res.data.map((r) => r.id);
    const total = res.data[0]?.total_count ?? 0;
    if (ids.length === 0) return { rows: [], total: Number(total) };
    const { data, error } = await supabase.from("books").select("*").in("id", ids);
    if (error) throw new Error(describeError(error).message);
    const byId = new Map((data as unknown as BookRow[]).map((r) => [r.id, dbToBook(r)]));
    return { rows: ids.map((id) => byId.get(id)).filter((b): b is Book => !!b), total: Number(total) };
  }

  let query = supabase.from("books").select("*", { count: "exact" });
  const flags = new Set(q.flags);
  if (flags.has("archived")) query = query.not("archived_at", "is", null);
  else query = query.is("archived_at", null);
  if (flags.has("missing-price")) query = query.is("price", null);
  if (flags.has("missing-cover")) query = query.is("thumbnail", null);
  if (flags.has("non-circulating")) query = query.eq("is_circulating", false);
  if (q.genre !== "All") query = query.eq("genre", q.genre);
  if (q.category !== "All") query = query.eq("category", q.category);
  if (q.language !== "All") query = query.eq("language", q.language);
  if (q.status === "Out of Stock") query = query.eq("total_copies", 0);
  if (q.status === "Available") query = query.gt("available_copies", 0);
  if (q.status === "Unavailable") query = query.eq("available_copies", 0).gt("total_copies", 0);
  const s = sanitizeForOr(term);
  if (s) {
    const like = `*${s}*`;
    query = query.or(
      ["title", "title_bangla", "author", "author_bangla", "id", "isbn"].map((c) => `${c}.ilike.${like}`).join(","),
    );
  }
  const from = (q.page - 1) * q.pageSize;
  const { data, error, count } = await query.order("id").range(from, from + q.pageSize - 1);
  if (error) throw new Error(describeError(error).message);
  return { rows: (data as unknown as BookRow[]).map(dbToBook), total: count ?? 0 };
}

/* --------------------------------------------------------------- stats */

export interface InventoryStats {
  titles: number;
  totalCopies: number;
  available: number;
  issued: number;
  reserved: number;
  lowStock: number;
  missingPrice: number;
  missingCover: number;
  nonCirculating: number;
  archived: number;
}

const EMPTY_STATS: InventoryStats = {
  titles: 0, totalCopies: 0, available: 0, issued: 0, reserved: 0, lowStock: 0,
  missingPrice: 0, missingCover: 0, nonCirculating: 0, archived: 0,
};

/** Catalogue-wide totals. Reads only small numeric columns, paging past the 1,000-row cap. */
export async function fetchInventoryStats(): Promise<InventoryStats> {
  const stats = { ...EMPTY_STATS };
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("books")
      .select("total_copies, available_copies, issued_copies, reserved_copies, price, thumbnail, is_circulating, archived_at")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(describeError(error).message);
    const rows = (data ?? []) as unknown as Pick<
      BookRow,
      "total_copies" | "available_copies" | "issued_copies" | "reserved_copies" | "price" | "thumbnail" | "is_circulating" | "archived_at"
    >[];
    for (const r of rows) {
      if (r.archived_at) {
        stats.archived++;
        continue;
      }
      stats.titles++;
      stats.totalCopies += r.total_copies;
      stats.available += r.available_copies;
      stats.issued += r.issued_copies;
      stats.reserved += r.reserved_copies;
      if (isLowStock({ availableCopies: r.available_copies, totalCopies: r.total_copies })) stats.lowStock++;
      if (r.price === null) stats.missingPrice++;
      if (!r.thumbnail) stats.missingCover++;
      if (!r.is_circulating) stats.nonCirculating++;
    }
    if (rows.length < PAGE) break;
  }
  return stats;
}

/** Every book matching nothing but the archive flag (used by Export). */
export async function fetchAllBooks(includeArchived = false): Promise<Book[]> {
  const out: Book[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from("books").select("*");
    if (!includeArchived) q = q.is("archived_at", null);
    const { data, error } = await q.order("id").range(from, from + PAGE - 1);
    if (error) throw new Error(describeError(error).message);
    const rows = (data ?? []) as unknown as BookRow[];
    out.push(...rows.map(dbToBook));
    if (rows.length < PAGE) break;
  }
  return out;
}

/* ------------------------------------------------------------- covers */

/** Uploads an (already compressed) cover as `covers/<bookId>.webp` and records the path. */
async function uploadCoverFile(bookId: string, blob: Blob): Promise<Outcome<string>> {
  const path = `${bookId}.webp`;
  const { error: upErr } = await supabase.storage
    .from("covers")
    .upload(path, blob, { contentType: "image/webp", upsert: true, cacheControl: "3600" });
  if (upErr) return { success: false, error: describeError(upErr).message };
  const { error } = await supabase.from("books").update({ thumbnail: path }).eq("id", bookId);
  if (error) return { success: false, error: describeError(error).message };
  return { success: true, data: path };
}

/* --------------------------------------------------------------- hook */

export function useInventory(query: BookQuery) {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStats>(EMPTY_STATS);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [facets, setFacets] = useState<{ genres: string[]; categories: string[]; languages: string[] }>({
    genres: [], categories: [], languages: [],
  });
  const reqId = useRef(0);
  const key = JSON.stringify(query);

  const loadPage = useCallback(async () => {
    const my = ++reqId.current;
    setLoading(true);
    try {
      const { rows, total } = await fetchBookPage(JSON.parse(key) as BookQuery);
      if (my !== reqId.current) return; // a newer query won
      setBooks(rows);
      setTotal(total);
      setError(null);
    } catch (e) {
      if (my === reqId.current) setError(describeError(e).message);
    } finally {
      if (my === reqId.current) setLoading(false);
    }
  }, [key]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchInventoryStats());
      setStatsLoaded(true);
    } catch (e) {
      console.error("Inventory stats failed:", describeError(e).message);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    loadStats();
    callRpc<{ genres: string[]; categories: string[]; languages: string[] }>("catalog_facets").then((r) => {
      if (r.success && r.data) {
        setFacets({
          genres: (r.data.genres ?? []).filter(Boolean),
          categories: (r.data.categories ?? []).filter(Boolean),
          languages: (r.data.languages ?? []).filter(Boolean),
        });
      }
    });
  }, [loadStats]);

  const refresh = useCallback(async () => {
    await Promise.all([loadPage(), loadStats()]);
  }, [loadPage, loadStats]);

  const addBook = useCallback(async (input: NewBookInput, cover?: Blob | null): Promise<Outcome<string>> => {
    if (!input.title.trim()) return { success: false, error: "Title is required." };
    // Contract: omit id / issued / reserved / available; the database generates them.
    const { data, error } = await supabase
      .from("books")
      .insert({ ...metadataToDb(input), total_copies: Math.max(0, Math.round(input.totalCopies)) } as never)
      .select("id")
      .single();
    if (error) return { success: false, error: describeError(error).message };
    const id = (data as unknown as { id: string }).id;
    if (cover) {
      const up = await uploadCoverFile(id, cover);
      if (!up.success) {
        await refresh();
        return { success: false, error: `Book saved as ${id}, but the cover upload failed: ${up.error}` };
      }
    }
    await refresh();
    return { success: true, data: id };
  }, [refresh]);

  const updateBook = useCallback(async (id: string, m: BookMetadata): Promise<Outcome> => {
    if (!m.title.trim()) return { success: false, error: "Title is required." };
    const { error } = await supabase.from("books").update(metadataToDb(m) as never).eq("id", id);
    if (error) return { success: false, error: describeError(error).message };
    await refresh();
    return { success: true, data: undefined };
  }, [refresh]);

  const setCover = useCallback(async (id: string, cover: Blob): Promise<Outcome<string>> => {
    const res = await uploadCoverFile(id, cover);
    if (res.success) await loadPage();
    return res;
  }, [loadPage]);

  const adjustStock = useCallback(async (id: string, newTotal: number, reason: string): Promise<Outcome> => {
    const res = await callRpc("adjust_stock", { p_book_id: id, p_new_total: newTotal, p_reason: reason });
    if (!res.success) return { success: false, error: res.error, code: res.code };
    await refresh();
    return { success: true, data: undefined };
  }, [refresh]);

  const setArchived = useCallback(async (id: string, archived: boolean): Promise<Outcome> => {
    const { error } = await supabase
      .from("books")
      .update({ archived_at: archived ? new Date().toISOString() : null } as never)
      .eq("id", id);
    if (error) return { success: false, error: describeError(error).message };
    await refresh();
    return { success: true, data: undefined };
  }, [refresh]);

  return {
    books, total, loading, error, stats, statsLoaded, facets,
    refresh, addBook, updateBook, setCover, adjustStock, setArchived,
  };
}

/** Catalogue-wide stats only (Dashboard). */
export function useInventoryStats() {
  const [stats, setStats] = useState<InventoryStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchInventoryStats()
      .then(setStats)
      .catch((e) => console.error("Inventory stats failed:", describeError(e).message))
      .finally(() => setLoading(false));
  }, []);
  return { stats, loading };
}

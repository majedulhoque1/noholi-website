import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublic } from "./supabase";

// Ported from v1 web/src/lib/books.js. Every function takes an optional client and defaults
// to `supabasePublic` (anon, no stored session), so they work in SSR route loaders and in the
// browser. Errors are thrown as-is: callers show `describeError(err)`.

/**
 * Columns anon may read (supabase/CONTRACT.md §2). Never select price/location/*_raw or `*`:
 * the database refuses with 42501.
 */
export const BOOK_COLUMNS =
  "id,title,title_bangla,author,author_bangla,genre,publisher,year_of_publication,edition," +
  "language,category,isbn,total_copies,issued_copies,reserved_copies,available_copies," +
  "condition,pages,thumbnail,is_circulating";

/** One `books` row as the public site reads it. */
export type BookRow = {
  id: string;
  title: string;
  title_bangla: string | null;
  author: string | null;
  author_bangla: string | null;
  genre: string | null;
  publisher: string | null;
  year_of_publication: string | null;
  edition: string | null;
  language: string | null;
  category: string | null;
  isbn: string | null;
  total_copies: number | null;
  issued_copies?: number | null;
  reserved_copies?: number | null;
  available_copies: number | null;
  condition: string | null;
  pages: number | null;
  thumbnail: string | null;
  is_circulating: boolean | null;
};

/** The subset `search_books` returns, plus `total_count` (the same on every row). */
export type BookSearchRow = Omit<BookRow, "issued_copies" | "reserved_copies"> & {
  total_count: number;
};

/** Anything the cover, title and availability helpers can read. */
export type BookLike = Pick<
  BookRow,
  | "id"
  | "title"
  | "title_bangla"
  | "author"
  | "author_bangla"
  | "language"
  | "thumbnail"
  | "total_copies"
  | "available_copies"
  | "is_circulating"
>;

export type CatalogFacets = { genres: string[]; categories: string[]; languages: string[] };

export type BookLang = "en" | "bn";

// ---------------------------------------------------------------------------------------------
// ids

/**
 * `BK-0001` in any case, or an old legacy slug such as `bk-0001-himur-neel-josna`, to the
 * canonical id. null for anything that is not a book id (the old fictional slugs).
 */
export function normalizeBookId(raw: string | null | undefined): string | null {
  const m = /^bk-(\d+)(?:$|-)/i.exec(String(raw ?? "").trim());
  return m ? `BK-${m[1]}` : null;
}

// ---------------------------------------------------------------------------------------------
// presentation helpers

/** Public URL of a stored cover in the `covers` bucket, or null (callers draw a cover instead). */
export function coverUrl(book: { thumbnail?: string | null } | null | undefined): string | null {
  if (!book?.thumbnail) return null;
  return supabasePublic.storage.from("covers").getPublicUrl(book.thumbnail).data.publicUrl;
}

export const hasBengali = (s: string | null | undefined) => /[ঀ-৿]/.test(s ?? "");

/** Title for the current language: Bangla title in Bangla mode, English otherwise; falls back to the other. */
export function displayTitle(b: Pick<BookLike, "title" | "title_bangla">, lang: BookLang): string {
  return (lang === "bn" ? b.title_bangla || b.title : b.title || b.title_bangla) || "";
}

export function displayAuthor(
  b: Pick<BookLike, "author" | "author_bangla">,
  lang: BookLang,
): string {
  return (lang === "bn" ? b.author_bangla || b.author : b.author || b.author_bangla) || "";
}

/** The title in the other language, when the book has one and it differs from the main title. */
export function altTitle(b: Pick<BookLike, "title" | "title_bangla">, lang: BookLang): string {
  const main = displayTitle(b, lang);
  const other = (lang === "bn" ? b.title : b.title_bangla) || "";
  return other && other !== main ? other : "";
}

export function altAuthor(b: Pick<BookLike, "author" | "author_bangla">, lang: BookLang): string {
  const main = displayAuthor(b, lang);
  const other = (lang === "bn" ? b.author : b.author_bangla) || "";
  return other && other !== main ? other : "";
}

/** A number in the reader's own digits (Bangla digits in Bangla mode). Always explicit, so SSR matches the browser. */
export function fmtNum(n: number, lang: BookLang): string {
  return n.toLocaleString(lang === "bn" ? "bn-BD" : "en-US", { maximumFractionDigits: 2 });
}

/** A stable cover colour (0..7, the `--cover-N` tokens) for a book id, so a book looks the same everywhere. */
export function toneOf(id: string | null | undefined): number {
  let h = 0;
  for (const ch of String(id ?? "")) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h % 8;
}

export type Availability = {
  state: "available" | "reading" | "loan" | "none";
  /** Copies free to borrow right now (never negative). */
  available: number;
  total: number;
  /** A member can send a Borrow Request. */
  canBorrow: boolean;
};

/**
 * Live availability from the copy counts. `is_circulating = false` means reading-room only
 * (no borrowing at all); otherwise it is `available_copies` of `total_copies`.
 */
export function bookAvailability(
  b: Pick<BookLike, "total_copies" | "available_copies" | "is_circulating"> | null | undefined,
): Availability {
  const total = Number(b?.total_copies) || 0;
  const available = Math.max(0, Number(b?.available_copies) || 0);
  if (b && b.is_circulating === false) {
    return { state: "reading", available, total, canBorrow: false };
  }
  if (available > 0)
    return { state: "available", available, total: total || available, canBorrow: true };
  if (total === 0) return { state: "none", available: 0, total: 0, canBorrow: false };
  return { state: "loan", available: 0, total, canBorrow: false };
}

// ---------------------------------------------------------------------------------------------
// queries

export type SearchParams = {
  q?: string | null;
  genre?: string | null;
  category?: string | null;
  language?: string | null;
  /** Multi-select filters: a book matches when it equals ANY value of a list; lists combine with AND. */
  genres?: readonly string[] | null;
  categories?: readonly string[] | null;
  languages?: readonly string[] | null;
  availability?: readonly AvailabilityBucket[] | null;
  page?: number;
  pageSize?: number;
  sort?: BookSort | null;
};

/**
 * The availability filter's buckets (supabase/CONTRACT.md §4): `reading` = reading room only;
 * `borrowed` = all copies on loan; `limited` = exactly one free copy of several; `available` = the rest
 * with a free copy.
 */
export const AVAILABILITY_BUCKETS = ["available", "limited", "borrowed", "reading"] as const;
export type AvailabilityBucket = (typeof AVAILABILITY_BUCKETS)[number];

/** Drops blanks and duplicates; null when nothing is left, so the RPC argument can be omitted. */
const cleanList = (v: readonly string[] | null | undefined): string[] | null => {
  const out = [...new Set((v ?? []).map((x) => x.trim()).filter(Boolean))];
  return out.length ? out : null;
};

/** Array filter arguments for the catalogue RPCs; empty lists are left out entirely. */
function listArgs(p: Pick<SearchParams, "genres" | "categories" | "languages" | "availability">) {
  const args: {
    genres?: string[];
    categories?: string[];
    languages?: string[];
    availability?: string[];
  } = {};
  const genres = cleanList(p.genres);
  const categories = cleanList(p.categories);
  const languages = cleanList(p.languages);
  const availability = cleanList(p.availability);
  if (genres) args.genres = genres;
  if (categories) args.categories = categories;
  if (languages) args.languages = languages;
  if (availability) args.availability = availability;
  return args;
}

/** Orders `search_books` accepts (supabase/CONTRACT.md §4); "relevance" is the server default. */
export const BOOK_SORTS = [
  "relevance",
  "title",
  "title-desc",
  "author",
  "newest",
  "oldest",
] as const;
export type BookSort = (typeof BOOK_SORTS)[number];

export type SearchResult = { rows: BookSearchRow[]; total: number };

/**
 * Server-side search (English and Bangla). Ordered by relevance unless `sort` says otherwise.
 * Returns { rows, total }; `total` is the match count across all pages.
 */
export async function searchBooks(
  {
    q = "",
    genre = null,
    category = null,
    language = null,
    genres = null,
    categories = null,
    languages = null,
    availability = null,
    page = 1,
    pageSize = 24,
    sort = null,
  }: SearchParams = {},
  opts: { client?: SupabaseClient; signal?: AbortSignal } = {},
): Promise<SearchResult> {
  const client = opts.client ?? supabasePublic;
  let req = client.rpc("search_books", {
    q: q?.trim() ? q.trim() : null,
    genre: genre || null,
    category: category || null,
    language: language || null,
    page,
    page_size: pageSize,
    // Omitted for relevance so the call also works before the sort migration is applied.
    ...(sort && sort !== "relevance" ? { sort } : {}),
    ...listArgs({ genres, categories, languages, availability }),
  });
  if (opts.signal) req = req.abortSignal(opts.signal);
  const { data, error } = await req;
  if (error) throw error;
  const rows = (data ?? []) as BookSearchRow[];
  return { rows, total: rows[0]?.total_count ?? 0 };
}

const EMPTY_FACETS: CatalogFacets = { genres: [], categories: [], languages: [] };

/** Distinct genre / category / language values of the live catalogue. */
export async function catalogFacets(
  client: SupabaseClient = supabasePublic,
): Promise<CatalogFacets> {
  const { data, error } = await client.rpc("catalog_facets");
  if (error) throw error;
  return { ...EMPTY_FACETS, ...((data as Partial<CatalogFacets> | null) ?? {}) };
}

/**
 * Live counts beside each filter option. Each facet's counts apply `q` and the OTHER facets'
 * selections but not its own. A value missing from a map has 0 books.
 */
export type FacetCounts = {
  total: number;
  genres: Record<string, number>;
  categories: Record<string, number>;
  languages: Record<string, number>;
  availability: Record<AvailabilityBucket, number>;
};

export async function catalogFacetCounts(
  params: Pick<SearchParams, "q" | "genres" | "categories" | "languages" | "availability"> = {},
  opts: { client?: SupabaseClient; signal?: AbortSignal } = {},
): Promise<FacetCounts> {
  const client = opts.client ?? supabasePublic;
  let req = client.rpc("catalog_facet_counts", {
    q: params.q?.trim() ? params.q.trim() : null,
    ...listArgs(params),
  });
  if (opts.signal) req = req.abortSignal(opts.signal);
  const { data, error } = await req;
  if (error) throw error;
  const d = (data ?? {}) as Partial<FacetCounts>;
  return {
    total: d.total ?? 0,
    genres: d.genres ?? {},
    categories: d.categories ?? {},
    languages: d.languages ?? {},
    availability: {
      available: d.availability?.available ?? 0,
      limited: d.availability?.limited ?? 0,
      borrowed: d.availability?.borrowed ?? 0,
      reading: d.availability?.reading ?? 0,
    },
  };
}

// The facet list changes only when staff edit the catalogue, so reuse it for a few minutes
// instead of re-asking on every filter change. A failure is never cached.
let facetCache: { at: number; value: Promise<CatalogFacets> } | null = null;
const FACET_TTL_MS = 5 * 60 * 1000;

export function catalogFacetsCached(): Promise<CatalogFacets> {
  if (facetCache && Date.now() - facetCache.at < FACET_TTL_MS) return facetCache.value;
  const value = catalogFacets();
  facetCache = { at: Date.now(), value };
  value.catch(() => {
    if (facetCache?.value === value) facetCache = null;
  });
  return value;
}

/** One live (not archived) book by id; null when there is no such book. Accepts `bk-0001` in any case. */
export async function getBook(
  id: string,
  client: SupabaseClient = supabasePublic,
): Promise<BookRow | null> {
  const bookId = normalizeBookId(id);
  if (!bookId) return null;
  const { data, error } = await client
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("id", bookId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as BookRow | null) ?? null;
}

/** Today's date in Dhaka as YYYY-MM-DD (the library's own day). */
function todayDhaka(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
}

/**
 * `count` live books that have a cover: a different run of the shelves each day, stable for the
 * whole Dhaka day (reloads, SSR and the browser agree). Used by the home page.
 */
export async function getShelfBooks(
  count: number,
  client: SupabaseClient = supabasePublic,
): Promise<BookRow[]> {
  const withCover = (columns: string, opts?: { count: "exact"; head: true }) =>
    client.from("books").select(columns, opts).not("thumbnail", "is", null).is("archived_at", null);
  const { count: total, error: cErr } = await withCover("id", { count: "exact", head: true });
  if (cErr) throw cErr;
  let h = 0;
  for (const ch of todayDhaka()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const n = total ?? 0;
  const offset = n > count ? h % (n - count) : 0;
  const { data, error } = await withCover(BOOK_COLUMNS)
    .order("id", { ascending: false })
    .range(offset, offset + count - 1);
  if (error) throw error;
  return (data ?? []) as unknown as BookRow[];
}

/** Noholi's own imprint: `publisher = 'Noholi'` exactly (as the legacy site did). Covers first. */
export async function getNoholiBooks(
  count: number,
  client: SupabaseClient = supabasePublic,
): Promise<BookRow[]> {
  const { data, error } = await client
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("publisher", "Noholi")
    .is("archived_at", null)
    .order("thumbnail", { ascending: true, nullsFirst: false })
    .order("year_of_publication", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true })
    .limit(count);
  if (error) throw error;
  return (data ?? []) as unknown as BookRow[];
}

// ---------------------------------------------------------------------------------------------
// public settings

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
  today: string;
};

export async function getPublicSettings(
  client: SupabaseClient = supabasePublic,
): Promise<PublicSettings> {
  const { data, error } = await client.rpc("get_public_settings");
  if (error) throw error;
  return data as PublicSettings;
}

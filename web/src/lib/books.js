import { supabase } from './supabase.js';

// Columns anon may read. Never select price/location/*_raw or `*` (the DB refuses).
export const BOOK_COLUMNS =
  'id,title,title_bangla,author,author_bangla,genre,publisher,year_of_publication,edition,' +
  'language,category,isbn,total_copies,issued_copies,reserved_copies,available_copies,' +
  'condition,pages,thumbnail,is_circulating';

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** `/books/bk-0001-himur-neel-josna` — the id prefix makes every slug unique and parseable. */
export function bookSlug(book) {
  const tail = slugify(book.title);
  const id = String(book.id).toLowerCase();
  return tail ? `${id}-${tail}` : id;
}

/** Pulls the book id back out of a slug; null for old fictional slugs like `quiet-hours`. */
export function idFromSlug(slug) {
  const m = /^bk-(\d+)/i.exec(String(slug || ''));
  return m ? `BK-${m[1]}` : null;
}

export function bookPath(book) {
  return `/books/${bookSlug(book)}`;
}

/** Public URL of a stored cover, or null (callers render the typographic placeholder). */
export function coverUrl(book) {
  if (!book?.thumbnail) return null;
  return supabase.storage.from('covers').getPublicUrl(book.thumbnail).data.publicUrl;
}

/** Display title: English if present, else Bangla. */
export const displayTitle = (b) => b?.title || b?.title_bangla || '';
export const displayAuthor = (b) => b?.author || b?.author_bangla || '';

/** Server-side search (Bangla + English). Returns { rows, total }. */
export async function searchBooks({ q = '', genre = null, category = null, language = null, page = 1, pageSize = 24 } = {}) {
  const { data, error } = await supabase.rpc('search_books', {
    q: q || null, genre, category, language, page, page_size: pageSize,
  });
  if (error) throw error;
  return { rows: data || [], total: data?.[0]?.total_count ?? 0 };
}

export async function getBookBySlug(slug) {
  const id = idFromSlug(slug);
  if (!id) return null;
  const { data, error } = await supabase.from('books').select(BOOK_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCatalogFacets() {
  const { data, error } = await supabase.rpc('catalog_facets');
  if (error) throw error;
  return data || { genres: [], categories: [], languages: [] };
}

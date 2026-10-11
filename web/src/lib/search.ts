import type { TKey } from "./i18n";
import { articles, audiobooks, books, type Book } from "./data";
import {
  coverUrl,
  displayAuthor,
  displayTitle,
  searchBooks,
  toneOf,
  type BookLang,
  type BookSearchRow,
} from "./books";

export type SearchGroup =
  "Books" | "Noholi Books" | "E-Books" | "Audio Books" | "Authors" | "Write Ups";

export type SearchItem = {
  key: string;
  group: SearchGroup;
  title: string;
  sub: string;
  /** Extra text that matches but isn't shown (Bangla/English alternates). */
  alt: string;
  tone?: number;
  /** URL of a real cover image (books from the catalogue). */
  cover?: string | null;
  link:
    | { to: "/book/$id"; params: { id: string } }
    | { to: "/read/$id"; params: { id: string } }
    | { to: "/article/$slug"; params: { slug: string } }
    | { to: "/audio/$id"; params: { id: string } }
    | { to: "/search"; search: { q: string } };
  bookId?: string;
  audioId?: string;
};

const bookItem = (b: Book, group: SearchGroup): SearchItem => ({
  key: `${group}-${b.id}`,
  group,
  title: b.language === "Bangla" ? b.titleBn : b.titleEn,
  sub: b.language === "Bangla" ? b.authorBn : b.authorEn,
  alt: `${b.titleEn} ${b.titleBn} ${b.authorEn} ${b.authorBn} ${b.isbn} ${b.publisher}`,
  tone: b.tone,
  // The sample e-books only exist in the reader; real catalogue books are searched on the server.
  link:
    group === "E-Books"
      ? { to: "/read/$id", params: { id: b.id } }
      : { to: "/book/$id", params: { id: b.id } },
  bookId: b.id,
});

const authorMap = new Map<string, { bn: string; count: number }>();
books.forEach((b) => {
  const a = authorMap.get(b.authorEn);
  authorMap.set(b.authorEn, { bn: b.authorBn, count: (a?.count ?? 0) + 1 });
});
audiobooks.forEach((a) => {
  if (!authorMap.has(a.authorEn)) authorMap.set(a.authorEn, { bn: "", count: 0 });
});

export const searchIndex: SearchItem[] = [
  ...books.filter((b) => !b.noholi).map((b) => bookItem(b, "Books")),
  ...books.filter((b) => b.noholi).map((b) => bookItem(b, "Noholi Books")),
  ...books.filter((b) => b.ebook).map((b) => bookItem(b, "E-Books")),
  ...audiobooks.map((a): SearchItem => ({
    key: `audio-${a.id}`,
    group: "Audio Books",
    title: a.titleEn,
    sub: `${a.authorEn} · read by ${a.narrator}`,
    alt: `${a.titleBn} ${a.narrator}`,
    tone: a.tone,
    link: { to: "/audio/$id", params: { id: a.id } },
    audioId: a.id,
  })),
  ...[...authorMap.entries()].map(([en, v]): SearchItem => ({
    key: `author-${en}`,
    group: "Authors",
    title: en,
    sub: v.count ? `${v.count} title${v.count > 1 ? "s" : ""} in the library` : "Audio books",
    alt: v.bn,
    link: { to: "/search", search: { q: en } },
  })),
  ...articles.map((a): SearchItem => ({
    key: `article-${a.slug}`,
    group: "Write Ups",
    title: a.title,
    sub: `${a.kind === "blog" ? "Blog" : a.kind === "creative" ? "Creative Writing" : "Book Review"} · ${a.author}`,
    alt: `${a.excerpt} ${a.body.join(" ")} ${a.bookId ? (books.find((b) => b.id === a.bookId)?.authorEn ?? "") : ""}`,
    link: { to: "/article/$slug", params: { slug: a.slug } },
  })),
];

/** Translation key for each group's heading. */
export const groupLabel: Record<SearchGroup, TKey> = {
  Books: "books",
  "Noholi Books": "noholiBooks",
  "E-Books": "ebooks",
  "Audio Books": "audiobooks",
  Authors: "catalog.groupAuthors",
  "Write Ups": "writeups",
};

export const groupOrder: SearchGroup[] = [
  "Books",
  "Noholi Books",
  "E-Books",
  "Audio Books",
  "Authors",
  "Write Ups",
];

/**
 * Groups served by the local index only. "Books" come from the server (`search_books`); the local
 * "Books", "Noholi Books" and "Authors" entries are sample data that still back the picker mode
 * (`onPick`) used by the coming-soon member forms, and are never shown on public pages.
 */
export const publicLocalGroups: SearchGroup[] = ["E-Books", "Audio Books", "Write Ups"];

/** A catalogue book from `search_books` as a search result. */
export function bookRowToItem(b: BookSearchRow, lang: BookLang): SearchItem {
  return {
    key: `Books-${b.id}`,
    group: "Books",
    title: displayTitle(b, lang),
    sub: displayAuthor(b, lang),
    alt: "",
    tone: toneOf(b.id),
    cover: coverUrl(b),
    link: { to: "/book/$id", params: { id: b.id } },
    bookId: b.id,
  };
}

/** Server search for the autocomplete and the search page. `signal` aborts a stale request. */
export async function searchBookItems(
  q: string,
  opts: { lang: BookLang; pageSize: number; page?: number; signal?: AbortSignal },
): Promise<{ items: SearchItem[]; total: number }> {
  const { rows, total } = await searchBooks(
    { q, pageSize: opts.pageSize, page: opts.page ?? 1 },
    { signal: opts.signal },
  );
  return { items: rows.map((r) => bookRowToItem(r, opts.lang)), total };
}

const norm = (s: string) => s.toLowerCase().normalize("NFC");

/** Ranked search: title/author prefix > word prefix > anywhere > body text. */
export function runSearch(q: string, groups: SearchGroup[] = groupOrder): SearchItem[] {
  const n = norm(q.trim());
  if (!n) return [];
  const scored: [number, SearchItem][] = [];
  for (const it of searchIndex) {
    if (!groups.includes(it.group)) continue;
    const head = norm(`${it.title} ${it.sub}`);
    const alt = norm(it.alt);
    let s = 0;
    if (norm(it.title).startsWith(n)) s = 4;
    else if (head.split(/\s+/).some((w) => w.startsWith(n))) s = 3;
    else if (head.includes(n)) s = 2;
    else if (alt.includes(n)) s = 1;
    if (s) scored.push([s, it]);
  }
  return scored.sort((a, b) => b[0] - a[0]).map(([, it]) => it);
}

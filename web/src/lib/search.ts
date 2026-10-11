import { articles, audiobooks, books, type Book } from "./data";

export type SearchGroup = "Books" | "Noholi Books" | "E-Books" | "Audio Books" | "Authors" | "Write Ups";

export type SearchItem = {
  key: string;
  group: SearchGroup;
  title: string;
  sub: string;
  /** Extra text that matches but isn't shown (Bangla/English alternates). */
  alt: string;
  tone?: number;
  link:
    | { to: "/book/$id"; params: { id: string } }
    | { to: "/article/$slug"; params: { slug: string } }
    | { to: "/audio/$id"; params: { id: string } }
    | { to: "/search"; search: { q: string } };
  bookId?: string;
  audioId?: string;
};

const bookItem = (b: Book, group: SearchGroup): SearchItem => ({
  key: `${group}-${b.id}`, group, title: b.language === "Bangla" ? b.titleBn : b.titleEn, sub: b.language === "Bangla" ? b.authorBn : b.authorEn,
  alt: `${b.titleEn} ${b.titleBn} ${b.authorEn} ${b.authorBn} ${b.isbn} ${b.publisher}`, tone: b.tone,
  link: { to: "/book/$id", params: { id: b.id } }, bookId: b.id,
});

const authorMap = new Map<string, { bn: string; count: number }>();
books.forEach((b) => { const a = authorMap.get(b.authorEn); authorMap.set(b.authorEn, { bn: b.authorBn, count: (a?.count ?? 0) + 1 }); });
audiobooks.forEach((a) => { if (!authorMap.has(a.authorEn)) authorMap.set(a.authorEn, { bn: "", count: 0 }); });

export const searchIndex: SearchItem[] = [
  ...books.filter((b) => !b.noholi).map((b) => bookItem(b, "Books")),
  ...books.filter((b) => b.noholi).map((b) => bookItem(b, "Noholi Books")),
  ...books.filter((b) => b.ebook).map((b) => bookItem(b, "E-Books")),
  ...audiobooks.map((a): SearchItem => ({
    key: `audio-${a.id}`, group: "Audio Books", title: a.titleEn, sub: `${a.authorEn} · read by ${a.narrator}`,
    alt: `${a.titleBn} ${a.narrator}`, tone: a.tone, link: { to: "/audio/$id", params: { id: a.id } }, audioId: a.id,
  })),
  ...[...authorMap.entries()].map(([en, v]): SearchItem => ({
    key: `author-${en}`, group: "Authors", title: en, sub: v.count ? `${v.count} title${v.count > 1 ? "s" : ""} in the library` : "Audio books",
    alt: v.bn, link: { to: "/search", search: { q: en } },
  })),
  ...articles.map((a): SearchItem => ({
    key: `article-${a.slug}`, group: "Write Ups",
    title: a.title, sub: `${a.kind === "blog" ? "Blog" : a.kind === "creative" ? "Creative Writing" : "Book Review"} · ${a.author}`,
    alt: `${a.excerpt} ${a.body.join(" ")} ${a.bookId ? (books.find((b) => b.id === a.bookId)?.authorEn ?? "") : ""}`,
    link: { to: "/article/$slug", params: { slug: a.slug } },
  })),
];

export const groupOrder: SearchGroup[] = ["Books", "Noholi Books", "E-Books", "Audio Books", "Authors", "Write Ups"];

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

// Legacy URL helpers. The v1 site used /books/bk-0001-some-title; the new app uses /book/BK-0001.
// The redirect route files in src/routes (catalog.tsx, books.$slug.tsx, member.*.tsx, ...) are thin wrappers
// that throw a permanent (301) redirect from beforeLoad, so it works on the server and in the browser.

/** "bk-0001-some-title" -> "BK-0001". Returns null when the slug does not start with a book id. */
export function bookIdFromSlug(slug: string | undefined): string | null {
  const m = /^bk-(\d+)(?:-|$)/i.exec(slug ?? "");
  return m ? `BK-${m[1]}` : null;
}

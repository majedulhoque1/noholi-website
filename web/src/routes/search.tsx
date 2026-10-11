import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Empty, PageIntro } from "@/components/noholi";
import { SearchBox, SearchResultRow } from "@/components/search-box";
import {
  groupLabel,
  groupOrder,
  publicLocalGroups,
  runSearch,
  searchBookItems,
  type SearchItem,
} from "@/lib/search";
import { describeError } from "@/lib/supabase";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.coerce.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Search — Noholi Library" },
      {
        name: "description",
        content: "Search Noholi's books, e-books, audio books, authors and write ups.",
      },
      { property: "og:title", content: "Search Noholi Library" },
      { property: "og:description", content: "Find books, authors and writing across Noholi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

/** Books shown on the search page; the catalogue page lists the rest. */
const PAGE_SIZE = 12;

type BookState =
  | { status: "idle" | "loading" }
  | { status: "ready"; items: SearchItem[]; total: number }
  | { status: "error"; error: string };

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const { t, lang } = useApp();
  const query = q.trim();

  const [books, setBooks] = useState<BookState>({ status: "idle" });
  useEffect(() => {
    if (!query) {
      setBooks({ status: "idle" });
      return;
    }
    const ctrl = new AbortController();
    setBooks({ status: "loading" });
    searchBookItems(query, { lang, pageSize: PAGE_SIZE, signal: ctrl.signal })
      .then(({ items, total }) => setBooks({ status: "ready", items, total }))
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setBooks({ status: "error", error: describeError(err) });
      });
    return () => ctrl.abort();
  }, [query, lang]);

  const local = useMemo(() => runSearch(query, publicLocalGroups), [query]);
  const bookItems = books.status === "ready" ? books.items : [];
  const grouped = groupOrder
    .map((g) => [g, g === "Books" ? bookItems : local.filter((r) => r.group === g)] as const)
    .filter(([, l]) => l.length);
  const bookTotal = books.status === "ready" ? books.total : 0;
  const settled = books.status === "ready" || books.status === "error";

  return (
    <>
      <PageIntro
        eyebrow={t("catalog.searchEyebrow")}
        title={query ? t("catalog.searchResultsFor", { q: query }) : t("catalog.searchPageTitle")}
      >
        {query
          ? books.status === "ready"
            ? t("catalog.searchSummary", {
                books: t(bookTotal === 1 ? "catalog.countOne" : "catalog.count", { n: bookTotal }),
                other: local.length,
              })
            : ""
          : t("catalog.searchPageIntro")}
      </PageIntro>
      <div className="container-page">
        <SearchBox key={q} className="max-w-2xl" autoFocus={!q} />
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {grouped.map(([g, l]) => (
            <a key={g} href={`#${g.replace(/\s/g, "-")}`} className="hover:text-foreground">
              {t(groupLabel[g])}{" "}
              <span className="tabular-nums">{g === "Books" ? bookTotal : l.length}</span>
            </a>
          ))}
        </div>
        <div className="mt-12 space-y-14" aria-busy={books.status === "loading"}>
          {query && books.status === "loading" && (
            <p className="text-sm text-muted-foreground" role="status">
              {t("catalog.searching")}
            </p>
          )}
          {books.status === "error" && (
            <div role="alert" className="border border-destructive/40 p-4 text-sm">
              {t("catalog.searchError", { error: books.error })}
            </div>
          )}
          {query && settled && books.status === "ready" && grouped.length === 0 && (
            <Empty
              title={t("catalog.searchNothingTitle")}
              body={t("catalog.searchNothingBody", { q: query })}
            />
          )}
          {grouped.map(([g, l]) => (
            <section key={g} id={g.replace(/\s/g, "-")}>
              <h2 className="rule-top pt-5 text-3xl">{t(groupLabel[g])}</h2>
              <div className="mt-2 grid gap-x-10 divide-y divide-border md:grid-cols-2 md:divide-y-0">
                {l.map((it) => (
                  <div key={it.key} className="md:border-b md:border-border">
                    <SearchResultRow it={it} />
                  </div>
                ))}
              </div>
              {g === "Books" && bookTotal > l.length && (
                <Button variant="outline" className="mt-6" asChild>
                  <Link to="/library/books" search={{ q: query }}>
                    {t("catalog.seeAllInCatalogue", { n: bookTotal })}
                  </Link>
                </Button>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

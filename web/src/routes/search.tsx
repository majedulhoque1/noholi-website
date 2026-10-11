import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Empty, PageIntro } from "@/components/noholi";
import { SearchBox, SearchResultRow } from "@/components/search-box";
import { groupOrder, runSearch } from "@/lib/search";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
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

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const res = runSearch(q);
  const grouped = groupOrder
    .map((g) => [g, res.filter((r) => r.group === g)] as const)
    .filter(([, l]) => l.length);
  return (
    <>
      <PageIntro eyebrow="Search" title={q ? <>Results for “{q}”</> : "Search the library."}>
        {q
          ? `${res.length} result${res.length === 1 ? "" : "s"} across the catalogue and write ups.`
          : "Books, Noholi Books, e-books, audio books, authors and write ups."}
      </PageIntro>
      <div className="container-page">
        <SearchBox key={q} className="max-w-2xl" autoFocus={!q} />
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {grouped.map(([g, l]) => (
            <a key={g} href={`#${g.replace(/\s/g, "-")}`} className="hover:text-foreground">
              {g} <span className="tabular-nums">{l.length}</span>
            </a>
          ))}
        </div>
        <div className="mt-12 space-y-14">
          {q && grouped.length === 0 && (
            <Empty
              title="Nothing on our shelves yet."
              body={`We couldn't find “${q}”. Try another spelling, or recommend it for the library.`}
            />
          )}
          {grouped.map(([g, l]) => (
            <section key={g} id={g.replace(/\s/g, "-")}>
              <h2 className="rule-top pt-5 text-3xl">{g}</h2>
              <div className="mt-2 grid gap-x-10 divide-y divide-border md:grid-cols-2 md:divide-y-0">
                {l.map((it) => (
                  <div key={it.key} className="md:border-b md:border-border">
                    <SearchResultRow it={it} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

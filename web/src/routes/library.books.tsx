import { createFileRoute, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/search-box";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Empty, PageIntro } from "@/components/noholi";
import { LiveBookCard } from "@/components/catalog-bits";
import {
  catalogFacetsCached,
  fmtNum,
  searchBooks,
  type BookSearchRow,
  type CatalogFacets,
} from "@/lib/books";
import { describeError } from "@/lib/supabase";
import { useApp } from "@/lib/store";

const PAGE_SIZE = 24;

const optionalString = z.coerce.string().optional().catch(undefined);
const searchSchema = z.object({
  q: optionalString,
  genre: optionalString,
  category: optionalString,
  language: optionalString,
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

type FilterKey = "genre" | "category" | "language";
const FILTERS: { key: FilterKey; facet: keyof CatalogFacets }[] = [
  { key: "genre", facet: "genres" },
  { key: "category", facet: "categories" },
  { key: "language", facet: "languages" },
];

const norm = (v: string | undefined | null) => (v ?? "").trim().toLowerCase();

/**
 * URL filter values may be loosely typed (`?genre=fiction`, old links): match them to a real
 * facet value case-insensitively; a genre that is really a category (e.g. "children") moves over.
 */
function resolveFilters(
  search: { genre?: string; category?: string; language?: string },
  facets: CatalogFacets | null,
): Record<FilterKey, string> {
  const out: Record<FilterKey, string> = {
    genre: search.genre ?? "",
    category: search.category ?? "",
    language: search.language ?? "",
  };
  if (!facets) return out;
  for (const f of FILTERS) {
    const raw = out[f.key];
    if (!raw) continue;
    out[f.key] = facets[f.facet].find((o) => norm(o) === norm(raw)) ?? raw;
  }
  if (out.genre && !facets.genres.includes(out.genre) && !out.category) {
    const asCategory = facets.categories.find((o) => norm(o) === norm(out.genre));
    if (asCategory) {
      out.category = asCategory;
      out.genre = "";
    }
  }
  return out;
}

export const Route = createFileRoute("/library/books")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    genre: search.genre,
    category: search.category,
    language: search.language,
    page: search.page,
  }),
  loader: async ({ deps }) => {
    // Errors are returned, not thrown: a failed fetch must never look like "no books".
    const [facetsRes] = await Promise.allSettled([catalogFacetsCached()]);
    const facets = facetsRes.status === "fulfilled" ? facetsRes.value : null;
    const facetsError = facetsRes.status === "rejected" ? describeError(facetsRes.reason) : null;
    const filters = resolveFilters(deps, facets);
    const page = deps.page ?? 1;
    try {
      const result = await searchBooks({
        q: deps.q ?? "",
        genre: filters.genre,
        category: filters.category,
        language: filters.language,
        page,
        pageSize: PAGE_SIZE,
      });
      return { facets, facetsError, filters, page, result, error: null as string | null };
    } catch (err) {
      return {
        facets,
        facetsError,
        filters,
        page,
        result: { rows: [] as BookSearchRow[], total: 0 },
        error: describeError(err),
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Books — Noholi Library catalogue" },
      {
        name: "description",
        content:
          "Search and filter Noholi's printed collection of Bangla and English books by genre, category and language.",
      },
      { property: "og:title", content: "Browse the Noholi catalogue" },
      {
        property: "og:description",
        content: "Search the Noholi Library catalogue in Bangla or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BooksPage,
});

function FilterFields({
  facets,
  filters,
  wide,
  onChange,
}: {
  facets: CatalogFacets | null;
  filters: Record<FilterKey, string>;
  wide?: boolean;
  onChange: (key: FilterKey, value: string) => void;
}) {
  const { t } = useApp();
  const label: Record<FilterKey, string> = {
    genre: t("catalog.filterGenre"),
    category: t("catalog.filterCategory"),
    language: t("catalog.filterLanguage"),
  };
  const all: Record<FilterKey, string> = {
    genre: t("catalog.allGenres"),
    category: t("catalog.allCategories"),
    language: t("catalog.allLanguages"),
  };
  return (
    <div className={wide ? "grid grid-cols-3 gap-8" : "space-y-6"}>
      {FILTERS.map((f) => {
        const options = facets?.[f.facet] ?? [];
        const value = filters[f.key];
        const id = `f-${f.key}${wide ? "-wide" : ""}`;
        return (
          <div key={f.key} className="min-w-0">
            <label htmlFor={id} className="eyebrow mb-2 block">
              {label[f.key]}
            </label>
            <select
              id={id}
              value={value}
              disabled={!facets}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="h-11 w-full min-w-0 border border-foreground/30 bg-background px-3 text-sm outline-none focus:border-foreground disabled:opacity-60"
            >
              <option value="">{all[f.key]}</option>
              {value && !options.includes(value) && <option value={value}>{value}</option>}
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function BooksPage() {
  const { t, lang } = useApp();
  const search = Route.useSearch();
  const { facets, facetsError, filters, page, result, error } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const fetching = useRouterState({ select: (s) => s.isLoading });
  const gridRef = useRef<HTMLDivElement>(null);

  const q = (search.q ?? "").trim();
  const activeFilters = FILTERS.filter((f) => filters[f.key]);
  const active = activeFilters.length;

  // The search text is applied to the URL after a short pause (or on Enter), so every keystroke
  // doesn't hit the server, and refresh / back / shared links still work.
  const [draft, setDraft] = useState(q);
  const qRef = useRef(q);
  qRef.current = q;
  useEffect(() => setDraft(q), [q]);
  const commit = (value: string) => {
    const next = value.trim();
    if (next === qRef.current) return;
    void navigate({
      search: (prev) => ({ ...prev, q: next || undefined, page: undefined }),
      replace: true,
      resetScroll: false,
    });
  };
  useEffect(() => {
    if (draft.trim() === qRef.current) return;
    const id = setTimeout(() => commit(draft), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const setFilter = (key: FilterKey, value: string) =>
    void navigate({
      // Writing the resolved values keeps the URL canonical and drops a stale loose value.
      search: (prev) => ({
        ...prev,
        genre: filters.genre || undefined,
        category: filters.category || undefined,
        language: filters.language || undefined,
        [key]: value || undefined,
        page: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  const clearFilters = () =>
    void navigate({
      search: (prev) => ({
        ...prev,
        genre: undefined,
        category: undefined,
        language: undefined,
        page: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  const resetAll = () => {
    setDraft("");
    void navigate({ search: {}, replace: true, resetScroll: false });
  };
  const goPage = (n: number) => {
    void navigate({
      search: (prev) => ({ ...prev, page: n > 1 ? n : undefined }),
      resetScroll: false,
    });
    gridRef.current?.scrollIntoView({ block: "start" });
  };

  const [panel, setPanel] = useState(false);
  const [sheet, setSheet] = useState(false);
  const toggleFilters = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setPanel((o) => !o);
    else setSheet(true);
  };
  useEffect(() => {
    if (!panel) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [panel]);

  const rows = result.rows;
  const total = result.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countText = `${t(total === 1 ? "catalog.countOne" : "catalog.count", {
    n: fmtNum(total, lang),
  })}${q ? t("catalog.forQuery", { q }) : ""}`;

  return (
    <>
      <PageIntro eyebrow={`${t("library")} / ${t("books")}`} title={t("catalog.title")} compact />
      <section className="container-page">
        <div className="sticky top-[var(--hdr,109px)] z-30 -mx-4 bg-background/90 px-4 py-3 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 md:gap-3">
            <Button
              variant={active > 0 || panel ? "accent" : "outline"}
              className="h-12 px-4 md:px-5"
              onClick={toggleFilters}
              aria-expanded={panel}
              aria-controls="book-filters"
            >
              <SlidersHorizontal /> <span className="hidden sm:inline">{t("catalog.filters")}</span>
              {active > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background/30 px-1 text-xs tabular-nums">
                  {active}
                </span>
              )}
            </Button>
            <SearchBox
              value={draft}
              onValueChange={setDraft}
              onSubmit={commit}
              suggest={false}
              placeholder={t("search")}
              inputClassName="border-foreground/30 text-base"
            />
          </div>
          {panel && (
            <div
              id="book-filters"
              role="region"
              aria-label={t("catalog.filterRegion")}
              className="absolute inset-x-4 top-full z-30 mt-1 hidden max-h-[calc(100vh-var(--hdr,109px)-7rem)] overflow-y-auto border border-border bg-popover p-6 text-popover-foreground shadow-lg lg:block"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl">
                  {t("catalog.filters")}
                  {active > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">({active})</span>
                  )}
                </h2>
                <div className="flex items-center gap-4">
                  {active > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm underline underline-offset-4 hover:text-accent"
                    >
                      {t("catalog.resetFilters")}
                    </button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("catalog.closeFilters")}
                    onClick={() => setPanel(false)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
              <FilterFields facets={facets} filters={filters} wide onChange={setFilter} />
              {facetsError && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {t("catalog.facetsError", { error: facetsError })}
                </p>
              )}
            </div>
          )}
          <Sheet open={sheet} onOpenChange={setSheet}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-background p-6">
              <SheetTitle className="sr-only">{t("catalog.filters")}</SheetTitle>
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="font-display text-xl">
                  {t("catalog.filters")}
                  {active > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">({active})</span>
                  )}
                </h2>
                {active > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm underline underline-offset-4 hover:text-accent"
                  >
                    {t("catalog.clearAll")}
                  </button>
                )}
              </div>
              <FilterFields facets={facets} filters={filters} onChange={setFilter} />
              {facetsError && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {t("catalog.facetsError", { error: facetsError })}
                </p>
              )}
              <Button className="mt-6 w-full" onClick={() => setSheet(false)}>
                {t("catalog.showResults", { n: fmtNum(total, lang) })}
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-5" ref={gridRef}>
          {active > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key, "")}
                  className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-foreground/30 px-3 text-xs hover:border-foreground"
                  aria-label={t("catalog.removeFilter", { value: filters[f.key] })}
                >
                  <span className="truncate">{filters[f.key]}</span>
                  <X className="h-3 w-3 shrink-0" />
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="h-7 px-2 text-xs underline underline-offset-4"
              >
                {t("catalog.clearAll")}
              </button>
            </div>
          )}

          <div className="mb-5 text-sm text-muted-foreground" aria-live="polite">
            {fetching ? t("catalog.loading") : error ? "" : countText}
          </div>

          {error ? (
            <div role="alert" className="border border-destructive/40 px-6 py-12 text-center">
              <h3 className="text-2xl">{t("catalog.errorTitle")}</h3>
              <p className="mx-auto mt-2 max-w-md break-words text-sm text-muted-foreground">
                {error}
              </p>
              <Button className="mt-6" variant="outline" onClick={() => void router.invalidate()}>
                {t("catalog.tryAgain")}
              </Button>
            </div>
          ) : rows.length ? (
            <div
              aria-busy={fetching}
              className={`grid grid-cols-2 gap-x-5 gap-y-10 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${fetching ? "opacity-60" : ""}`}
            >
              {rows.map((b, i) => (
                <LiveBookCard key={b.id} book={b} eager={i < 5} />
              ))}
            </div>
          ) : page > 1 ? (
            <Empty
              title={t("catalog.noPage", { page: fmtNum(page, lang) })}
              body=""
              action={
                <Button variant="outline" onClick={() => goPage(1)}>
                  {t("catalog.goToPage1")}
                </Button>
              }
            />
          ) : (
            <Empty
              title={t("catalog.noMatchTitle")}
              body={t("catalog.noMatchBody")}
              action={
                <Button variant="outline" onClick={resetAll}>
                  {t("catalog.resetSearch")}
                </Button>
              }
            />
          )}

          {!error && rows.length > 0 && totalPages > 1 && (
            <nav
              aria-label={t("catalog.pages")}
              className="mt-12 flex items-center justify-center gap-4 border-t border-border pt-6"
            >
              <Button
                variant="outline"
                disabled={page <= 1 || fetching}
                onClick={() => goPage(page - 1)}
              >
                {t("catalog.previous")}
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t("catalog.pageOf", {
                  page: fmtNum(page, lang),
                  total: fmtNum(totalPages, lang),
                })}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages || fetching}
                onClick={() => goPage(page + 1)}
              >
                {t("catalog.next")}
              </Button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

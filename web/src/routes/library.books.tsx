import { createFileRoute, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchBox } from "@/components/search-box";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty, PageIntro } from "@/components/noholi";
import { LiveBookCard } from "@/components/catalog-bits";
import {
  AVAILABILITY_BUCKETS,
  BOOK_SORTS,
  catalogFacetCounts,
  catalogFacetsCached,
  fmtNum,
  searchBooks,
  type AvailabilityBucket,
  type BookSearchRow,
  type BookSort,
  type CatalogFacets,
  type FacetCounts,
} from "@/lib/books";
import { describeError } from "@/lib/supabase";
import { useApp } from "@/lib/store";

const PAGE_SIZE = 24;

const optionalString = z.coerce.string().optional().catch(undefined);
/**
 * A filter in the URL: `?genre=Fiction` (also every old link), or `?genre=["Fiction","Thriller"]`.
 * Always a list once parsed.
 */
const filterList = z
  .preprocess(
    (v) => (v == null || v === "" ? undefined : Array.isArray(v) ? v : [v]),
    z.array(z.coerce.string()).optional(),
  )
  .catch(undefined);
const searchSchema = z.object({
  q: optionalString,
  genre: filterList,
  category: filterList,
  language: filterList,
  availability: filterList,
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort: z.enum(BOOK_SORTS).optional().catch(undefined),
});

const SORT_LABEL: Record<BookSort, string> = {
  relevance: "catalog.sort.relevance",
  title: "catalog.sort.title",
  "title-desc": "catalog.sort.titleDesc",
  author: "catalog.sort.author",
  newest: "catalog.sort.newest",
  oldest: "catalog.sort.oldest",
};

type FilterKey = "genre" | "category" | "language" | "availability";
type Filters = Record<FilterKey, string[]>;
const FILTER_KEYS: FilterKey[] = ["genre", "category", "language", "availability"];
const FILTER_LABEL: Record<FilterKey, string> = {
  genre: "catalog.filterGenre",
  category: "catalog.filterCategory",
  language: "catalog.filterLanguage",
  availability: "catalog.filterAvailability",
};
const AVAIL_LABEL: Record<AvailabilityBucket, string> = {
  available: "catalog.avail.available",
  limited: "catalog.avail.limited",
  borrowed: "catalog.avail.borrowed",
  reading: "catalog.avail.reading",
};

const norm = (v: string | undefined | null) => (v ?? "").trim().toLowerCase();
const uniq = (v: string[]) => [...new Set(v.map((x) => x.trim()).filter(Boolean))];

/**
 * URL filter values may be loosely typed (`?genre=fiction`, old links): match each to a real
 * facet value case-insensitively; a genre that is really a category (e.g. "children") moves over,
 * and an unknown availability value is dropped.
 */
function resolveFilters(
  search: { genre?: string[]; category?: string[]; language?: string[]; availability?: string[] },
  facets: CatalogFacets | null,
): Filters {
  const out: Filters = {
    genre: uniq(search.genre ?? []),
    category: uniq(search.category ?? []),
    language: uniq(search.language ?? []),
    availability: uniq(search.availability ?? [])
      .map((v) => AVAILABILITY_BUCKETS.find((b) => b === norm(v)))
      .filter((v): v is AvailabilityBucket => !!v),
  };
  if (!facets) return out;
  const find = (list: string[], raw: string) => list.find((o) => norm(o) === norm(raw)) ?? raw;
  out.genre = uniq(out.genre.map((v) => find(facets.genres, v)));
  out.category = uniq(out.category.map((v) => find(facets.categories, v)));
  out.language = uniq(out.language.map((v) => find(facets.languages, v)));
  const moved: string[] = [];
  out.genre = out.genre.filter((g) => {
    if (facets.genres.includes(g)) return true;
    const asCategory = facets.categories.find((o) => norm(o) === norm(g));
    if (!asCategory) return true;
    moved.push(asCategory);
    return false;
  });
  out.category = uniq([...out.category, ...moved]);
  return out;
}

/** One value reads as a plain `?genre=Fiction`; several as a list. */
const toParam = (list: string[]) =>
  list.length === 0 ? undefined : list.length === 1 ? list[0] : list;

export const Route = createFileRoute("/library/books")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    genre: search.genre,
    category: search.category,
    language: search.language,
    availability: search.availability,
    page: search.page,
    sort: search.sort,
  }),
  loader: async ({ deps }) => {
    // Errors are returned, not thrown: a failed fetch must never look like "no books".
    const [facetsRes] = await Promise.allSettled([catalogFacetsCached()]);
    const facets = facetsRes.status === "fulfilled" ? facetsRes.value : null;
    const facetsError = facetsRes.status === "rejected" ? describeError(facetsRes.reason) : null;
    const filters = resolveFilters(deps, facets);
    const page = deps.page ?? 1;
    const lists = {
      genres: filters.genre,
      categories: filters.category,
      languages: filters.language,
      availability: filters.availability as AvailabilityBucket[],
    };
    // The counts are decoration: if they fail the panel simply shows no numbers.
    const countsReq: Promise<FacetCounts | null> = catalogFacetCounts({
      q: deps.q ?? "",
      ...lists,
    }).catch(() => null);
    try {
      const result = await searchBooks({
        q: deps.q ?? "",
        ...lists,
        page,
        pageSize: PAGE_SIZE,
        sort: deps.sort,
      });
      const counts = await countsReq;
      return { facets, facetsError, counts, filters, page, result, error: null as string | null };
    } catch (err) {
      return {
        facets,
        facetsError,
        counts: await countsReq,
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
  counts,
  filters,
  wide,
  onToggle,
}: {
  facets: CatalogFacets | null;
  counts: FacetCounts | null;
  filters: Filters;
  wide?: boolean;
  onToggle: (key: FilterKey, value: string) => void;
}) {
  const { t, lang } = useApp();
  const optionsOf = (key: FilterKey): { value: string; label: string; n: number | null }[] => {
    if (key === "availability") {
      return AVAILABILITY_BUCKETS.map((v) => ({
        value: v,
        label: t(AVAIL_LABEL[v] as never),
        n: counts ? counts.availability[v] : null,
      }));
    }
    const base =
      (key === "genre"
        ? facets?.genres
        : key === "category"
          ? facets?.categories
          : facets?.languages) ?? [];
    const map =
      key === "genre"
        ? counts?.genres
        : key === "category"
          ? counts?.categories
          : counts?.languages;
    // A selected value missing from the live list (stale link) stays visible so it can be unticked.
    const rows = uniq([...base, ...filters[key]]).map((v) => ({
      value: v,
      label: v,
      n: counts ? (map?.[v] ?? 0) : null,
    }));
    // Hundreds of genres: most-used first, so the useful ones sit at the top of the scroll box.
    if (key === "genre" && counts) rows.sort((x, y) => (y.n ?? 0) - (x.n ?? 0));
    return rows;
  };
  return (
    <div className={wide ? "grid grid-cols-4 gap-8" : "space-y-7"}>
      {FILTER_KEYS.map((k) => {
        const options = optionsOf(k);
        return (
          <fieldset key={k} className="min-w-0">
            <legend className="eyebrow mb-2">{t(FILTER_LABEL[k] as never)}</legend>
            <div className="max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-2">
              {options.length === 0 && (
                <p className="py-1 text-sm text-muted-foreground">{t("catalog.filterEmpty")}</p>
              )}
              {options.map((o, i) => {
                const id = `f-${k}-${i}${wide ? "-wide" : ""}`;
                const checked = filters[k].includes(o.value);
                return (
                  <label
                    key={o.value}
                    htmlFor={id}
                    className={`flex cursor-pointer items-center gap-3 py-1 text-sm ${o.n === 0 && !checked ? "text-muted-foreground" : ""}`}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => onToggle(k, o.value)}
                    />
                    <span className="min-w-0 flex-1 break-words">{o.label}</span>
                    {o.n !== null && (
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {fmtNum(o.n, lang)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

function BooksPage() {
  const { t, lang } = useApp();
  const search = Route.useSearch();
  const { facets, facetsError, counts, filters, page, result, error } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const fetching = useRouterState({ select: (s) => s.isLoading });
  const gridRef = useRef<HTMLDivElement>(null);

  const q = (search.q ?? "").trim();
  const chips = FILTER_KEYS.flatMap((k) => filters[k].map((value) => ({ key: k, value })));
  const active = chips.length;
  const chipLabel = (c: { key: FilterKey; value: string }) =>
    c.key === "availability" ? t(AVAIL_LABEL[c.value as AvailabilityBucket] as never) : c.value;

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

  const toggle = (key: FilterKey, value: string) => {
    const has = filters[key].includes(value);
    const next: Filters = {
      ...filters,
      [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value],
    };
    void navigate({
      // Writing the resolved values keeps the URL canonical and drops a stale loose value.
      search: (prev) => ({
        ...prev,
        genre: toParam(next.genre),
        category: toParam(next.category),
        language: toParam(next.language),
        availability: toParam(next.availability),
        page: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  };
  const clearFilters = () =>
    void navigate({
      search: (prev) => ({
        ...prev,
        genre: undefined,
        category: undefined,
        language: undefined,
        availability: undefined,
        page: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  const setSort = (value: string) =>
    void navigate({
      search: (prev) => ({
        ...prev,
        sort: value === "relevance" ? undefined : (value as BookSort),
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
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 md:grid-cols-[auto_minmax(0,1fr)_200px] md:gap-3">
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
              placeholder={t("search")}
              inputClassName="border-foreground/30 text-base"
            />
            <Select value={search.sort ?? "relevance"} onValueChange={setSort}>
              <SelectTrigger
                aria-label={t("catalog.sortLabel")}
                className="col-span-2 !h-10 rounded-none border-foreground/30 md:col-span-1 md:!h-12"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOK_SORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(SORT_LABEL[s] as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <FilterFields
                facets={facets}
                counts={counts}
                filters={filters}
                wide
                onToggle={toggle}
              />
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
              <FilterFields facets={facets} counts={counts} filters={filters} onToggle={toggle} />
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
              {chips.map((c) => (
                <button
                  key={`${c.key}:${c.value}`}
                  onClick={() => toggle(c.key, c.value)}
                  className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-foreground/30 px-3 text-xs hover:border-foreground"
                  aria-label={t("catalog.removeFilter", { value: chipLabel(c) })}
                >
                  <span className="truncate">{chipLabel(c)}</span>
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

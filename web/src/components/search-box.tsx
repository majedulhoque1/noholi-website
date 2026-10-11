import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Cover } from "@/components/noholi";
import {
  groupLabel,
  groupOrder,
  publicLocalGroups,
  runSearch,
  searchBookItems,
  type SearchGroup,
  type SearchItem,
} from "@/lib/search";
import { describeError } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  groups?: SearchGroup[];
  placeholder?: string;
  /**
   * Picker mode: called instead of navigating (e.g. choosing a book for a review). Picker mode
   * searches the local sample index only, because the callers look the picked id up in it.
   */
  onPick?: (item: SearchItem) => void;
  /** Controlled text, for pages that also filter a list as you type. */
  value?: string;
  onValueChange?: (v: string) => void;
  /** Called on Enter when `suggest` is off (the page applies the text itself). */
  onSubmit?: (v: string) => void;
  /** Show the grouped autocomplete. Turn off on pages that already list the results themselves. */
  suggest?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  perGroup?: number;
  showViewAll?: boolean;
};

/** Books shown in the autocomplete (one small server page). */
const BOOK_SUGGESTIONS = 6;
const DEBOUNCE_MS = 250;

type Remote = {
  status: "loading" | "ready" | "error";
  items: SearchItem[];
  error?: string;
};

/**
 * The one Noholi search: grouped autocomplete used across the site. Books come from the server
 * (`search_books`, debounced, stale requests aborted); write ups, e-books and audio books come
 * from the local index.
 */
export function SearchBox({
  groups = groupOrder,
  placeholder,
  onPick,
  value,
  onValueChange,
  onSubmit,
  suggest = true,
  autoFocus,
  className,
  inputClassName,
  perGroup = 4,
  showViewAll = true,
}: Props) {
  const { t, lang } = useApp();
  const ph = placeholder ?? t("search");
  const [inner, setInner] = useState("");
  const q = value ?? inner;
  const setQ = (v: string) => {
    if (onValueChange) onValueChange(v);
    else setInner(v);
  };
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const trimmed = q.trim();

  // Public pages: books from the server, the rest from the local index (no sample books).
  const remoteOn = suggest && !onPick && groups.includes("Books");
  const localGroups = onPick ? groups : groups.filter((g) => publicLocalGroups.includes(g));

  const [remote, setRemote] = useState<Remote | null>(null);
  useEffect(() => {
    if (!remoteOn || !trimmed) {
      setRemote(null);
      return;
    }
    const ctrl = new AbortController();
    // Keep the previous results on screen while the next page is on its way.
    setRemote((r) => ({ status: "loading", items: r?.items ?? [] }));
    const timer = setTimeout(() => {
      searchBookItems(trimmed, { lang, pageSize: BOOK_SUGGESTIONS, signal: ctrl.signal })
        .then(({ items }) => setRemote({ status: "ready", items }))
        .catch((err) => {
          if (ctrl.signal.aborted) return;
          setRemote({ status: "error", items: [], error: describeError(err) });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [trimmed, remoteOn, lang]);

  const grouped = useMemo(() => {
    const res = suggest ? runSearch(q, localGroups) : [];
    return groupOrder
      .filter((g) => groups.includes(g))
      .map((g) => {
        const list =
          g === "Books" && remoteOn
            ? (remote?.items ?? [])
            : res.filter((r) => r.group === g).slice(0, perGroup);
        return [g, list] as const;
      })
      .filter(([, l]) => l.length);
  }, [q, groups, localGroups, perGroup, remote, remoteOn, suggest]);
  const flat = grouped.flatMap(([, l]) => l);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const choose = (it: SearchItem) => {
    setOpen(false);
    if (onPick) {
      onPick(it);
      return;
    }
    nav(it.link as never);
  };
  const viewAll = () => {
    setOpen(false);
    nav({ to: "/search", search: { q } });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[active];
      if (!suggest && onSubmit) onSubmit(q);
      else if (open && it) choose(it);
      else if (!onPick && q.trim()) viewAll();
    } else if (e.key === "Escape") setOpen(false);
  };

  const show = suggest && open && trimmed.length > 0;
  const searching = remote?.status === "loading";
  const failed = remote?.status === "error";
  let idx = -1;
  return (
    <div ref={wrap} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ph}
        aria-activedescendant={show && flat[active] ? `${listId}-${active}` : undefined}
        value={q}
        autoFocus={autoFocus}
        placeholder={ph}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        className={cn(
          "h-12 w-full border border-border bg-background pl-11 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground [&::-webkit-search-cancel-button]:hidden",
          inputClassName,
        )}
      />
      {q && (
        <button
          type="button"
          aria-label={t("catalog.clearSearch")}
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {show && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-[min(70vh,520px)] overflow-y-auto border border-border bg-popover text-popover-foreground shadow-lg"
        >
          {failed && (
            <div role="alert" className="px-4 py-3 text-sm text-destructive">
              {t("catalog.searchError", { error: remote?.error ?? "" })}
            </div>
          )}
          {grouped.length === 0 && !failed ? (
            <div className="px-4 py-6 text-sm text-muted-foreground" aria-live="polite">
              {searching ? t("catalog.searching") : t("catalog.noResults", { q })}
            </div>
          ) : (
            grouped.map(([g, list]) => (
              <div key={g} className="border-b border-border py-2 last:border-b-0">
                <div className="eyebrow px-4 pb-1 pt-1">{t(groupLabel[g])}</div>
                {list.map((it) => {
                  idx++;
                  const i = idx;
                  return (
                    <button
                      type="button"
                      key={it.key}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={active === i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(it)}
                      className={cn(
                        "grid w-full grid-cols-[28px_minmax(0,1fr)] items-center gap-3 px-4 py-2 text-left",
                        active === i && "bg-muted",
                      )}
                    >
                      {it.tone !== undefined ? (
                        <Cover
                          title=""
                          author=""
                          tone={it.tone}
                          src={it.cover}
                          size="sm"
                          className="w-7 shadow-none"
                        />
                      ) : (
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-border font-display text-xs">
                          {it.group === "Authors" ? it.title.charAt(0) : "¶"}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-display text-base leading-tight">
                          {it.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {it.sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
          {showViewAll && !onPick && (
            <button
              type="button"
              onClick={viewAll}
              className="w-full border-t border-border px-4 py-3 text-left text-sm font-medium hover:bg-muted"
            >
              {t("catalog.viewAllResults", { q })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function SearchResultRow({ it }: { it: SearchItem }) {
  return (
    <Link
      {...(it.link as { to: "/search" })}
      className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-4 py-4 hover:text-accent"
    >
      {it.tone !== undefined ? (
        <Cover title="" author="" tone={it.tone} src={it.cover} size="sm" className="w-10" />
      ) : (
        <span className="grid h-10 w-10 place-items-center rounded-full border border-border font-display">
          {it.title.charAt(0)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-display text-xl">{it.title}</span>
        <span className="block truncate text-sm text-muted-foreground">{it.sub}</span>
      </span>
    </Link>
  );
}

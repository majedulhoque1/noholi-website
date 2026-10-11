import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Cover } from "@/components/noholi";
import { groupOrder, runSearch, type SearchGroup, type SearchItem } from "@/lib/search";
import { cn } from "@/lib/utils";

type Props = {
  groups?: SearchGroup[];
  placeholder?: string;
  /** Picker mode: called instead of navigating (e.g. choosing a book for a review). */
  onPick?: (item: SearchItem) => void;
  /** Controlled text, for pages that also filter a list as you type. */
  value?: string;
  onValueChange?: (v: string) => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  perGroup?: number;
  showViewAll?: boolean;
};

/** The one Noholi search: grouped autocomplete used across the site. */
export function SearchBox({
  groups = groupOrder,
  placeholder = "Search books, authors, write ups…",
  onPick,
  value,
  onValueChange,
  autoFocus,
  className,
  inputClassName,
  perGroup = 4,
  showViewAll = true,
}: Props) {
  const [inner, setInner] = useState("");
  const q = value ?? inner;
  const setQ = (v: string) => {
    onValueChange ? onValueChange(v) : setInner(v);
  };
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const res = runSearch(q, groups);
    return groupOrder
      .filter((g) => groups.includes(g))
      .map((g) => [g, res.filter((r) => r.group === g).slice(0, perGroup)] as const)
      .filter(([, l]) => l.length);
  }, [q, groups, perGroup]);
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
      if (open && it) choose(it);
      else if (!onPick && q.trim()) viewAll();
    } else if (e.key === "Escape") setOpen(false);
  };

  const show = open && q.trim().length > 0;
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
        aria-label={placeholder}
        aria-activedescendant={show && flat[active] ? `${listId}-${active}` : undefined}
        value={q}
        autoFocus={autoFocus}
        placeholder={placeholder}
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
          aria-label="Clear search"
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
          {grouped.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              Nothing on our shelves matches “{q}”. Try an author's name or a Bangla title.
            </div>
          ) : (
            grouped.map(([g, list]) => (
              <div key={g} className="border-b border-border py-2 last:border-b-0">
                <div className="eyebrow px-4 pb-1 pt-1">{g}</div>
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
              View all results for “{q}” →
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
        <Cover title="" author="" tone={it.tone} size="sm" className="w-10" />
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

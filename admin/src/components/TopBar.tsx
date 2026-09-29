import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileDropdown } from "@/components/ProfileDropdown";

interface TopBarProps {
  /** Opens the mobile drawer (shared with the bottom tab bar's "More"). */
  onOpenMenu: () => void;
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-2 md:h-12 md:gap-4 md:px-4">
        {!mobileSearchOpen && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Desktop: inline search, always visible. Unchanged from before. */}
        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search books, members, transactions…"
            className="h-8 w-full rounded border border-border bg-secondary pl-8 pr-3 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Mobile: icon button that expands into a full-width search row. */}
        {mobileSearchOpen ? (
          <div className="relative flex-1 md:hidden">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="Search books, members, transactions…"
              className="h-11 w-full rounded border border-border bg-secondary pl-8 pr-10 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        {!mobileSearchOpen && (
          <div className="ml-auto flex items-center gap-1 md:gap-3">
            <NotificationBell />
            <ProfileDropdown />
          </div>
        )}
      </header>
    </>
  );
}

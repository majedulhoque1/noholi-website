import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Mail, MapPin, Menu, Moon, Phone, Search, Sun, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Logo, MemberAvatar } from "@/components/noholi";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MemberStatus } from "@/components/member-ui";
import { SearchBox } from "@/components/search-box";
import { library } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const libraryLinks = [
  { to: "/library/books", k: "books" },
  { to: "/library/noholi", k: "noholiBooks" },
  { to: "/library/ebooks", k: "ebooks" },
  { to: "/library/audio", k: "audiobooks" },
  { to: "/library/gallery", k: "gallery" },
  { to: "/library/rules", k: "rules" },
] as const;
export const writeLinks = [
  { to: "/writeups/blogs", k: "blogs" },
  { to: "/writeups/creative", k: "creative" },
  { to: "/writeups/reviews", k: "reviews" },
] as const;

const navCls =
  "text-[0.92rem] font-semibold text-foreground/80 hover:text-foreground transition-colors data-[status=active]:text-foreground";

function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useApp();
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-full border border-border p-0.5 text-xs",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {(["en", "bn"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "h-full rounded-full px-2.5 transition-colors",
            lang === l
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l === "en" ? "EN" : "বাং"}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="rounded-full"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

function NavDrop({ label, items }: { label: string; items: readonly { to: string; k: string }[] }) {
  const { t } = useApp();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(navCls, "inline-flex items-center gap-1 outline-none")}>
        {label} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 rounded-sm p-1.5">
        {items.map((i) => (
          <DropdownMenuItem
            key={i.to}
            asChild
            className="cursor-pointer rounded-sm px-3 py-2 font-display text-base"
          >
            <Link to={i.to}>{t(i.k as never)}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[12%] translate-y-0 gap-0 rounded-sm p-0 sm:max-w-2xl [&>button]:hidden"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("[role=option],a,button[type=button]"))
              setTimeout(() => setOpen(false), 0);
          }}
        >
          <DialogTitle className="sr-only">Search Noholi</DialogTitle>
          <SearchBox autoFocus inputClassName="h-14 border-0 text-base" />
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Books, Noholi Books, e-books, audio books, authors and write ups · ↑↓ to move, Enter to
            open
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Small "Soon" tag for account sections that have no backend yet. */
function SoonTag({ className }: { className?: string }) {
  const { t } = useApp();
  return (
    <span
      className={cn(
        "rounded-sm border border-border px-1 py-px text-[0.625rem] font-medium uppercase leading-none tracking-wide text-muted-foreground",
        className,
      )}
    >
      {t("auth.soon")}
    </span>
  );
}

function WishlistMenu() {
  const { t } = useApp();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(navCls, "inline-flex items-center gap-1.5 px-2 outline-none")}
      >
        {t("wishlist")}
        <SoonTag />
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-sm p-1.5">
        {(["Books", "E-Books", "Audio Books"] as const).map((x) => (
          <DropdownMenuItem
            key={x}
            asChild
            className="cursor-pointer rounded-sm px-3 py-2 font-display text-base"
          >
            <Link to="/account/wishlist" search={{ type: x }}>
              {x}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const itemCls = "cursor-pointer rounded-sm px-3 py-1.5";
const subCls =
  "cursor-pointer rounded-sm py-1.5 pl-6 pr-3 text-muted-foreground focus:text-foreground";
const groupCls =
  "px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

function AccountMenu() {
  const { t, logout } = useApp();
  const { member, mustChangePassword } = useAuth();
  const nav = useNavigate();
  const name = member?.name ?? t("auth.yourAccount");
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t("auth.menu.account.aria")}
        className="inline-flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm outline-none hover:border-foreground/40"
      >
        <MemberAvatar className="h-7 w-7" textClass="text-sm" />
        <span className="max-w-[7rem] truncate font-semibold xl:max-w-[10rem]">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[calc(100vh-6rem)] w-72 overflow-y-auto rounded-sm p-0"
      >
        <div
          className="flex items-center gap-3 px-4 py-4"
          role="group"
          aria-label={t("auth.menu.patronDetails")}
        >
          <MemberAvatar className="h-11 w-11 shrink-0" textClass="text-lg" />
          <div className="min-w-0">
            <div className="truncate font-display text-lg leading-tight">{name}</div>
            {member && (
              <>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {t("memberId")}: {member.id}
                </div>
                <div className="mt-1 text-xs font-medium">
                  <MemberStatus status={member.status} />
                </div>
              </>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        {mustChangePassword ? (
          <div className="p-1.5">
            <DropdownMenuItem asChild className={cn(itemCls, "font-medium")}>
              <Link to="/account/password">{t("auth.nav.password")}</Link>
            </DropdownMenuItem>
          </div>
        ) : (
          <>
            <div className="p-1.5">
              <DropdownMenuItem asChild className={cn(itemCls, "font-medium")}>
                <Link to="/account">{t("auth.menu.dashboard")}</Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1.5">
              <div className={groupCls}>{t("auth.menu.library")}</div>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/borrowed">{t("auth.menu.borrowed")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/requests">{t("auth.menu.requests")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/fines">{t("auth.menu.fines")}</Link>
              </DropdownMenuItem>
              <div className={cn(groupCls, "mt-1")}>{t("auth.menu.collection")}</div>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/wishlist" className="flex items-center gap-2">
                  {t("wishlist")}
                  <SoonTag />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/recommendations" className="flex items-center gap-2">
                  {t("auth.menu.recommendations")}
                  <SoonTag />
                </Link>
              </DropdownMenuItem>
              <div className={cn(groupCls, "mt-1 flex items-center gap-2")}>
                <Link to="/account/contributions" className="hover:text-foreground">
                  {t("auth.menu.contributions")}
                </Link>
                <SoonTag />
              </div>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/contributions" search={{ f: "Blogs" }}>
                  {t("auth.menu.blogs")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/contributions" search={{ f: "Creative Writings" }}>
                  {t("auth.menu.creative")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/reviews" className="flex items-center gap-2">
                  {t("auth.menu.reviews")}
                  <SoonTag />
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1.5">
              <DropdownMenuItem
                asChild
                className={cn(itemCls, "font-semibold text-accent focus:text-accent")}
              >
                <Link to="/account/recommend" className="flex items-center gap-2">
                  {t("auth.menu.recommend")}
                  <SoonTag />
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1.5">
              <div className={groupCls}>{t("auth.menu.account")}</div>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/profile">{t("auth.menu.profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={subCls}>
                <Link to="/account/settings">{t("auth.menu.settings")}</Link>
              </DropdownMenuItem>
            </div>
          </>
        )}
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5">
          <DropdownMenuItem
            className={itemCls}
            onSelect={() => {
              logout();
              nav({ to: "/" });
            }}
          >
            {t("logout")}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav() {
  const { t, loggedIn, logout } = useApp();
  const { member, mustChangePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const Group = ({
    label,
    items,
  }: {
    label: string;
    items: readonly { to: string; k: string }[];
  }) => (
    <Collapsible>
      <CollapsibleTrigger className="group flex w-full items-center justify-between py-3 font-display text-2xl">
        {label}
        <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3 pl-4">
        {items.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            onClick={close}
            className="block py-2 text-muted-foreground hover:text-foreground"
          >
            {t(i.k as never)}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
          <Menu className="!size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto bg-background p-0 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex items-center border-b border-border px-6 py-4">
          <Logo className="h-8" />
        </div>
        {loggedIn && (
          <div className="border-b border-border px-6 py-5">
            <div className="break-words font-display text-xl">
              {member?.name ?? t("auth.yourAccount")}
            </div>
            {member && (
              <div className="text-xs text-muted-foreground">
                {member.id} · <MemberStatus status={member.status} />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {mustChangePassword ? (
                <Link
                  to="/account/password"
                  onClick={close}
                  className="underline underline-offset-4"
                >
                  {t("auth.nav.password")}
                </Link>
              ) : (
                <>
                  <Link to="/account" onClick={close} className="underline underline-offset-4">
                    {t("dashboard")}
                  </Link>
                  <Link
                    to="/account/requests"
                    onClick={close}
                    className="underline underline-offset-4"
                  >
                    {t("auth.nav.requests")}
                  </Link>
                  <Link
                    to="/account/borrowed"
                    onClick={close}
                    className="underline underline-offset-4"
                  >
                    {t("auth.menu.borrowed")}
                  </Link>
                  <Link
                    to="/account/fines"
                    onClick={close}
                    className="underline underline-offset-4"
                  >
                    {t("auth.menu.fines")}
                  </Link>
                  <Link
                    to="/account/profile"
                    onClick={close}
                    className="underline underline-offset-4"
                  >
                    {t("profile")}
                  </Link>
                  <Link
                    to="/account/settings"
                    onClick={close}
                    className="underline underline-offset-4"
                  >
                    {t("settings")}
                  </Link>
                  {(
                    [
                      ["/account/wishlist", t("wishlist")],
                      ["/account/recommendations", t("auth.menu.recommendations")],
                      ["/account/contributions", t("auth.menu.contributions")],
                      ["/account/reviews", t("auth.menu.reviews")],
                      ["/account/recommend", t("auth.menu.recommend")],
                    ] as const
                  ).map(([to, label]) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={close}
                      className="inline-flex items-center gap-1.5 underline underline-offset-4"
                    >
                      {label}
                      <SoonTag />
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
        <nav className="flex-1 divide-y divide-border px-6">
          <Link to="/" onClick={close} className="block py-3 font-display text-2xl">
            {t("home")}
          </Link>
          <Link to="/about" onClick={close} className="block py-3 font-display text-2xl">
            {t("about")}
          </Link>
          <Group label={t("library")} items={libraryLinks} />
          <Group
            label={t("writeups")}
            items={[{ to: "/writeups", k: "writeups" }, ...writeLinks]}
          />
          <Link to="/contact" onClick={close} className="block py-3 font-display text-2xl">
            {t("contact")}
          </Link>
        </nav>
        <div className="space-y-4 border-t border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("language")}</span>
            <LangToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("theme")}</span>
            <ThemeToggle />
          </div>
          {loggedIn ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                logout();
                close();
              }}
            >
              {t("logout")}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link to="/login" onClick={close}>
                  {t("login")}
                </Link>
              </Button>
              <Button variant="accent" asChild>
                <Link to="/join" onClick={close}>
                  {t("become")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Publishes the header's live height as `--hdr` on <html>, so sticky bars below it (catalogue
 * filters, rules contents) sit flush under it at every breakpoint.
 */
function useHeaderHeightVar() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--hdr", `${Math.round(el.offsetHeight)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return ref;
}

export function SiteHeader() {
  const { t, loggedIn } = useApp();
  const ref = useHeaderHeightVar();
  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur"
    >
      <div className="bg-foreground text-background">
        <div className="container-page flex h-9 items-center gap-5 text-xs">
          <a
            href={library.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 hover:opacity-80 md:inline-flex"
          >
            <MapPin className="h-3.5 w-3.5 opacity-70" />
            {library.addressShort}
          </a>
          <a href={library.phoneHref} className="inline-flex items-center gap-1.5 hover:opacity-80">
            <Phone className="h-3.5 w-3.5 opacity-70" />
            {library.phoneDisplay}
          </a>
          <a
            href={`mailto:${library.email}`}
            className="hidden items-center gap-1.5 hover:opacity-80 sm:inline-flex"
          >
            <Mail className="h-3.5 w-3.5 opacity-70" />
            {library.email}
          </a>
        </div>
      </div>
      <div className="container-page flex h-16 items-center gap-4 md:h-[72px]">
        <Link to="/" aria-label="Noholi home" className="shrink-0">
          <Logo />
        </Link>
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-5 whitespace-nowrap lg:flex xl:gap-7"
          aria-label="Main"
        >
          <Link to="/" className={navCls} activeOptions={{ exact: true }}>
            {t("home")}
          </Link>
          <Link to="/about" className={navCls}>
            {t("about")}
          </Link>
          <NavDrop label={t("library")} items={libraryLinks} />
          <NavDrop
            label={t("writeups")}
            items={[{ to: "/writeups", k: "writeups" }, ...writeLinks]}
          />
          <Link to="/contact" className={navCls}>
            {t("contact")}
          </Link>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-0">
          <GlobalSearch />
          <LangToggle className="hidden md:inline-flex" />
          <span className="hidden md:inline-flex">
            <ThemeToggle />
          </span>
          {loggedIn ? (
            <>
              <span className="hidden xl:block">
                <WishlistMenu />
              </span>
              <span className="hidden lg:block">
                <AccountMenu />
              </span>
              <Button variant="ghost" size="icon" asChild className="lg:hidden">
                <Link to="/account" aria-label="Account">
                  <User />
                </Link>
              </Button>
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" asChild>
                <Link to="/login">{t("login")}</Link>
              </Button>
              <Button variant="accent" asChild>
                <Link to="/join">{t("become")}</Link>
              </Button>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export { LangToggle, ThemeToggle };

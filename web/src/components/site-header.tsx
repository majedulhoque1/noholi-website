import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Search,
  Sun,
  User,
  Youtube,
} from "lucide-react";
import { useState } from "react";
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
import { SearchBox } from "@/components/search-box";
import { library, user } from "@/lib/data";
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

function WishlistMenu() {
  const { t, wishlist } = useApp();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(navCls, "inline-flex items-center gap-1 px-2 outline-none")}
      >
        {t("wishlist")}
        {wishlist.length > 0 && (
          <span className="text-xs font-normal tabular-nums text-muted-foreground">
            ({wishlist.length})
          </span>
        )}{" "}
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
  const { t, logout, lang } = useApp();
  const nav = useNavigate();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm outline-none hover:border-foreground/40">
        <MemberAvatar className="h-7 w-7" textClass="text-sm" />
        <span className="max-w-[10rem] truncate font-semibold">
          {lang === "bn" ? user.nameBn : user.name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[calc(100vh-6rem)] w-72 overflow-y-auto rounded-sm p-0"
      >
        <div className="flex items-center gap-3 px-4 py-4" aria-label="Patron details">
          <MemberAvatar className="h-11 w-11" textClass="text-lg" />
          <div className="min-w-0">
            <div className="truncate font-display text-lg leading-tight">
              {lang === "bn" ? user.nameBn : user.name}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t("memberId")}: {user.memberId}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {t("activePatron")}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5">
          <DropdownMenuItem asChild className={cn(itemCls, "font-medium")}>
            <Link to="/account">My Dashboard</Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5">
          <div className={groupCls}>My Library</div>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/borrowed">Borrowed Books</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/requests">Borrow Requests</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/fines">Overdue &amp; Fines</Link>
          </DropdownMenuItem>
          <div className={cn(groupCls, "mt-1")}>My Collection</div>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/wishlist">Wishlist</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/recommendations">My Recommendations</Link>
          </DropdownMenuItem>
          <div className={cn(groupCls, "mt-1")}>
            <Link to="/account/contributions" className="hover:text-foreground">
              My Contributions
            </Link>
          </div>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/contributions" search={{ f: "Blogs" }}>
              Blogs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/contributions" search={{ f: "Creative Writings" }}>
              Creative Writing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/reviews">Book Reviews</Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5">
          <DropdownMenuItem
            asChild
            className={cn(itemCls, "font-semibold text-accent focus:text-accent")}
          >
            <Link to="/account/recommend">Recommend a Book</Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5">
          <div className={groupCls}>My Account</div>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/profile">My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={subCls}>
            <Link to="/account/settings">Account Settings</Link>
          </DropdownMenuItem>
        </div>
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
  const { t, loggedIn, logout, lang } = useApp();
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
            <div className="font-display text-xl">{lang === "bn" ? user.nameBn : user.name}</div>
            <div className="text-xs text-muted-foreground">
              {user.memberId} · <span className="text-success">● {t("activePatron")}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link to="/account" onClick={close} className="underline underline-offset-4">
                {t("dashboard")}
              </Link>
              <Link to="/account/wishlist" onClick={close} className="underline underline-offset-4">
                {t("wishlist")}
              </Link>
              <Link to="/account/profile" onClick={close} className="underline underline-offset-4">
                {t("profile")}
              </Link>
              <Link to="/account/settings" onClick={close} className="underline underline-offset-4">
                {t("settings")}
              </Link>
              <Link to="/account/requests" onClick={close} className="underline underline-offset-4">
                Borrow requests
              </Link>
              <Link to="/account/borrowed" onClick={close} className="underline underline-offset-4">
                Borrowed books
              </Link>
              <Link to="/account/fines" onClick={close} className="underline underline-offset-4">
                Overdue &amp; fines
              </Link>
              <Link
                to="/account/recommendations"
                onClick={close}
                className="underline underline-offset-4"
              >
                My recommendations
              </Link>
              <Link
                to="/account/contributions"
                onClick={close}
                className="underline underline-offset-4"
              >
                My contributions
              </Link>
              <Link to="/account/reviews" onClick={close} className="underline underline-offset-4">
                My book reviews
              </Link>
              <Link
                to="/account/recommend"
                onClick={close}
                className="underline underline-offset-4"
              >
                Recommend a Book
              </Link>
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

export function SiteHeader() {
  const { t, loggedIn } = useApp();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur">
      <div className="bg-foreground text-background">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <div className="flex min-w-0 items-center gap-5">
            <a
              href={library.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 hover:opacity-80 md:inline-flex"
            >
              <MapPin className="h-3.5 w-3.5 opacity-70" />
              {library.addressShort}
            </a>
            <a
              href={library.phoneHref}
              className="inline-flex items-center gap-1.5 hover:opacity-80"
            >
              <Phone className="h-3.5 w-3.5 opacity-70" />
              {library.phoneDisplay}
            </a>
            <a
              href="mailto:hello@noholi.org"
              className="hidden items-center gap-1.5 hover:opacity-80 sm:inline-flex"
            >
              <Mail className="h-3.5 w-3.5 opacity-70" />
              hello@noholi.org
            </a>
          </div>
          <div className="flex items-center gap-3.5">
            <a href="#" aria-label="Facebook" className="hover:opacity-80">
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:opacity-80">
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:opacity-80">
              <Youtube className="h-3.5 w-3.5" />
            </a>
          </div>
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
              <span className="hidden lg:block">
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

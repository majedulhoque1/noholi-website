import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/noholi-logo.png";
import { availability, type Book } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <img src={logo} alt="Noholi Library" className={cn("logo-ink h-9 w-auto", className)} />;
}

export function Cover({
  title,
  author,
  tone,
  noholi,
  className,
  size = "md",
}: {
  title: string;
  author: string;
  tone: number;
  noholi?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const v = tone % 3;
  const ts = size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-[0.8rem]" : "text-lg";
  const as = size === "lg" ? "text-sm" : "text-[0.6rem]";
  return (
    <div
      className={cn("book3d relative aspect-[2/3]", className)}
      aria-hidden
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = e.currentTarget,
          r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5,
          y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", `${(-14 - x * 30).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(y * 12).toFixed(2)}deg`);
        el.dataset["active"] = "";
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget;
        el.style.removeProperty("--ry");
        el.style.removeProperty("--rx");
        delete el.dataset["active"];
      }}
    >
      <div className="book3d-body">
        <div className="book3d-back" style={{ background: `var(--cover-${tone})` }} />
        <div className="book3d-pages" />
        <div
          className="book3d-face relative h-full overflow-hidden rounded-[2px] shadow-book"
          style={{ background: `var(--cover-${tone})`, color: `var(--cover-${tone}-fg)` }}
        >
          <div className="book3d-bind absolute inset-y-0 left-0 w-[8.2%] mix-blend-overlay" />
          <div className="book3d-sheen pointer-events-none absolute inset-0" />
          {v === 0 && (
            <div className="flex h-full flex-col justify-between p-[10%] pl-[14%]">
              <div className={cn("uppercase tracking-[0.18em] opacity-75", as)}>{author}</div>
              <div>
                <div className="mb-2 h-px w-8 bg-current opacity-60" />
                <div className={cn("font-display leading-[1.05]", ts)}>{title}</div>
              </div>
            </div>
          )}
          {v === 1 && (
            <div className="flex h-full flex-col p-[10%] pl-[14%]">
              <div className={cn("font-display leading-[1.05]", ts)}>{title}</div>
              <div className="mx-auto my-auto aspect-square w-1/2 rounded-full border border-current opacity-40" />
              <div className={cn("uppercase tracking-[0.18em] opacity-75", as)}>{author}</div>
            </div>
          )}
          {v === 2 && (
            <div className="flex h-full flex-col items-center justify-center p-[12%] text-center">
              <div className={cn("mb-3 uppercase tracking-[0.18em] opacity-75", as)}>{author}</div>
              <div className={cn("font-display italic leading-[1.05]", ts)}>{title}</div>
              <div className="mt-3 flex gap-1 opacity-60">
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="h-1 w-1 rounded-full bg-current" />
              </div>
            </div>
          )}
          {noholi && (
            <div className={cn("absolute bottom-[5%] right-[7%] font-bangla opacity-80", as)}>
              নহলি
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const bookTitle = (b: Book, lang: string) =>
  b.language === "Bangla" || lang === "bn" ? b.titleBn : b.titleEn;
export const bookAuthor = (b: Book, lang: string) =>
  b.language === "Bangla" || lang === "bn" ? b.authorBn : b.authorEn;

export function BookCover({
  book,
  size,
  className,
}: {
  book: Book;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Cover
      title={book.language === "Bangla" ? book.titleBn : book.titleEn}
      author={book.language === "Bangla" ? book.authorBn : book.authorEn}
      tone={book.tone}
      noholi={book.noholi}
      size={size}
      className={className}
    />
  );
}

export function Availability({ book, className }: { book: Book; className?: string }) {
  const { t } = useApp();
  const a = availability(book);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        a === "unavailable" ? "text-muted-foreground" : "text-success",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          a === "available"
            ? "bg-success"
            : a === "limited"
              ? "border border-success"
              : "border border-muted-foreground",
        )}
      />
      {a === "unavailable" ? t(a) : `${t(a)} · ${book.availableCopies}/${book.totalCopies}`}
    </span>
  );
}

export function WishButton({
  id,
  className,
  label,
}: {
  id: string;
  className?: string;
  label?: boolean;
}) {
  const { inWish, toggleWish } = useApp();
  const on = inWish(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWish(id);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex items-center gap-2 text-sm transition-colors hover:text-accent",
        on && "text-accent",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", on && "fill-current")} />
      {label && (on ? "In wishlist" : "Add to wishlist")}
    </button>
  );
}

export function BookCard({ book, showMeta = true }: { book: Book; showMeta?: boolean }) {
  const { lang } = useApp();
  return (
    <div className="group relative">
      <Link to="/book/$id" params={{ id: book.id }} className="block">
        <BookCover book={book} />
      </Link>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div className="min-w-0">
          <Link
            to="/book/$id"
            params={{ id: book.id }}
            className="block font-display text-lg leading-tight hover:text-accent"
          >
            {bookTitle(book, lang)}
          </Link>
          <div className="mt-1 truncate text-sm text-muted-foreground">
            {bookAuthor(book, lang)}
          </div>
        </div>
        <WishButton id={book.id} className="mt-1 h-fit text-muted-foreground" />
      </div>
      {showMeta && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{book.genre}</span>
          <span>·</span>
          <span>{book.language}</span>
          <Availability book={book} className="w-full" />
        </div>
      )}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
  aside,
  compact,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header
      className={cn(
        "container-page",
        compact ? "pb-5 pt-8 md:pb-6 md:pt-10" : "pb-10 pt-14 md:pb-14 md:pt-20",
      )}
    >
      <div
        className={cn(
          "grid gap-8 border-b border-border md:grid-cols-[minmax(0,1fr)_auto] md:items-end",
          compact ? "pb-5" : "pb-10",
        )}
      >
        <div className="max-w-3xl">
          <div className="eyebrow mb-5">{eyebrow}</div>
          <h1 className="text-5xl leading-[0.98] md:text-7xl">{title}</h1>
          {children && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {children}
            </p>
          )}
        </div>
        {aside}
      </div>
    </header>
  );
}

export function SectionHead({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string;
  title: ReactNode;
  link?: ReactNode;
}) {
  return (
    <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 rule-top pt-5">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
        <h2 className="text-3xl md:text-5xl">{title}</h2>
      </div>
      {link}
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 text-muted-foreground" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-3 w-3", i < n && "fill-current text-foreground")} />
      ))}
    </span>
  );
}

export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-border px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex w-fit gap-1.5">
        {[0, 2, 5].map((t) => (
          <div
            key={t}
            className="h-12 w-2 rounded-[1px]"
            style={{ background: `var(--cover-${t})` }}
          />
        ))}
      </div>
      <h3 className="text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`;

const statusTone: Record<string, string> = {
  "Pending Review": "pending",
  Submitted: "pending",
  "Under Review": "pending",
  Considering: "pending",
  Draft: "muted",
  Approved: "ok",
  "Ready for Pickup": "ok",
  Active: "ok",
  Published: "ok",
  Acquired: "ok",
  Returned: "muted",
  Overdue: "bad",
  Rejected: "bad",
  "Needs Revision": "pending",
  Issued: "ok",
  Lost: "bad",
  Cancelled: "muted",
  "Not Planned": "muted",
  Due: "bad",
  Cleared: "muted",
};

/** Subtle status label: text + shape, never colour alone. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone[status] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium",
        tone === "ok"
          ? "text-success"
          : tone === "bad"
            ? "text-destructive"
            : tone === "pending"
              ? "text-foreground"
              : "text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "ok"
            ? "bg-success"
            : tone === "bad"
              ? "bg-destructive"
              : tone === "pending"
                ? "border border-foreground"
                : "bg-muted-foreground/50",
        )}
      />
      {status}
    </span>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-foreground font-display text-background",
        className,
      )}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/** The signed-in member's photo, used everywhere the member appears. Falls back to initials if removed. */
export function MemberAvatar({
  className,
  textClass = "text-base",
}: {
  className?: string;
  textClass?: string;
}) {
  const { avatar } = useApp();
  return avatar ? (
    <img
      src={avatar}
      alt="Your profile photo"
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  ) : (
    <Initials name="Aurko" className={cn(className, textClass)} />
  );
}

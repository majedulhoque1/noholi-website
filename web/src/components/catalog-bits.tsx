import { Link } from "@tanstack/react-router";
import { Cover } from "@/components/noholi";
import {
  bookAvailability,
  coverUrl,
  displayAuthor,
  displayTitle,
  toneOf,
  type BookLike,
} from "@/lib/books";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/** The cover of a real catalogue book: its picture from the `covers` bucket, or a drawn cover. */
export function LiveCover({
  book,
  size,
  className,
  eager,
}: {
  book: BookLike;
  size?: "sm" | "md" | "lg";
  className?: string;
  eager?: boolean;
}) {
  const { lang } = useApp();
  const title = displayTitle(book, lang);
  return (
    <Cover
      title={title}
      author={displayAuthor(book, lang)}
      tone={toneOf(book.id)}
      src={coverUrl(book)}
      alt={title}
      size={size}
      className={className}
      eager={eager}
    />
  );
}

/** Live availability from the copy counts: available of total, reading room only, or on loan. */
export function LiveAvailability({
  book,
  className,
}: {
  book: Pick<BookLike, "total_copies" | "available_copies" | "is_circulating">;
  className?: string;
}) {
  const { t } = useApp();
  const a = bookAvailability(book);
  const text =
    a.state === "reading"
      ? t("catalog.readingRoomOnly")
      : a.state === "available"
        ? t("catalog.availableOf", { available: a.available, total: a.total })
        : a.state === "loan"
          ? t("catalog.allOnLoan")
          : t("catalog.noCopies");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        a.state === "available" ? "text-success" : "text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          a.state === "available" ? "bg-success" : "border border-muted-foreground",
        )}
      />
      {text}
    </span>
  );
}

/** A catalogue card. Long titles wrap to two lines and are clipped, never overflowing the grid cell. */
export function LiveBookCard({
  book,
  showMeta = true,
  eager,
}: {
  book: BookLike & { genre?: string | null };
  showMeta?: boolean;
  eager?: boolean;
}) {
  const { lang } = useApp();
  const title = displayTitle(book, lang);
  return (
    <div className="group relative min-w-0">
      <Link to="/book/$id" params={{ id: book.id }} className="block" tabIndex={-1} aria-hidden>
        <LiveCover book={book} eager={eager} />
      </Link>
      <div className="mt-4 min-w-0">
        <Link
          to="/book/$id"
          params={{ id: book.id }}
          className="line-clamp-2 break-words font-display text-lg leading-tight hover:text-accent"
          lang={/[ঀ-৿]/.test(title) ? "bn" : undefined}
        >
          {title}
        </Link>
        <div className="mt-1 truncate text-sm text-muted-foreground">
          {displayAuthor(book, lang)}
        </div>
      </div>
      {showMeta && (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {book.genre && <span className="max-w-full truncate">{book.genre}</span>}
          {book.genre && book.language && <span aria-hidden>·</span>}
          {book.language && <span>{book.language}</span>}
          <LiveAvailability book={book} className="w-full" />
        </div>
      )}
    </div>
  );
}

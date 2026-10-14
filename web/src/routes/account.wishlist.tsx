import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Cover, Empty } from "@/components/noholi";
import { BookThumb, ErrorState } from "@/components/record-view";
import { audiobooks } from "@/lib/data";
import { BOOK_COLUMNS, displayAuthor, displayTitle, type BookRow } from "@/lib/books";
import { describeError, supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = ["All", "Books", "E-Books", "Audio Books"] as const;
export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "My wishlist — My Noholi" },
      {
        name: "description",
        content: "Your saved books, e-books and audio books from Noholi Library.",
      },
      { property: "og:title", content: "My wishlist — My Noholi" },
      {
        property: "og:description",
        content: "Your saved books, e-books and audio books from Noholi Library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: z.object({ type: z.enum(tabs).optional() }),
  component: Wishlist,
});

type Item =
  | { id: string; type: "Books"; book: BookRow }
  | { id: string; type: "Audio Books"; audio: (typeof audiobooks)[number] };

function Wishlist() {
  const { wishlist, toggleWish, play, collections, lang, t } = useApp();
  const { type: tab = "All" } = Route.useSearch();
  const [books, setBooks] = useState<Record<string, BookRow>>({});
  const [err, setErr] = useState<string | null>(null);

  // Wishlist rows hold ids only; fetch the catalogue records for the ones we do not have yet.
  const need = wishlist.filter((id) => !books[id] && !audiobooks.some((a) => a.id === id));
  const needKey = need.join(",");
  useEffect(() => {
    if (!needKey) return;
    let live = true;
    supabase
      .from("books")
      .select(BOOK_COLUMNS)
      .in("id", needKey.split(","))
      .then(({ data, error }) => {
        if (!live) return;
        if (error) return setErr(describeError(error));
        setErr(null);
        setBooks((m) => ({
          ...m,
          ...Object.fromEntries(((data ?? []) as unknown as BookRow[]).map((b) => [b.id, b])),
        }));
      });
    return () => {
      live = false;
    };
  }, [needKey]);

  const items: Item[] = wishlist.flatMap((id): Item[] => {
    const audio = audiobooks.find((a) => a.id === id);
    if (audio) return [{ id, type: "Audio Books", audio }];
    const book = books[id];
    return book ? [{ id, type: "Books", book }] : [];
  });
  const list = items.filter((i) => tab === "All" || i.type === tab);

  return (
    <>
      <h1 className="text-4xl">{t("auth.nav.wishlist")}</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        Your private reading list. Want Noholi to buy a book?{" "}
        <Link to="/account/recommend" className="underline underline-offset-2">
          Recommend it instead
        </Link>
        .
      </p>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((x) => (
          <Link
            key={x}
            to="/account/wishlist"
            search={x === "All" ? {} : { type: x }}
            aria-current={tab === x ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-full border px-4 text-sm",
              tab === x ? "border-foreground bg-foreground text-background" : "border-border",
            )}
          >
            {x}{" "}
            <span className="opacity-60">
              {x === "All" ? items.length : items.filter((i) => i.type === x).length}
            </span>
          </Link>
        ))}
      </div>
      {collections.error ? (
        <ErrorState
          title={t("lending.loadError")}
          message={collections.error}
          retryLabel={t("lending.retry")}
          onRetry={collections.reload}
        />
      ) : err ? (
        <p role="alert" className="text-sm text-destructive">
          {err}
        </p>
      ) : list.length === 0 ? (
        <Empty
          title={collections.loading ? t("auth.loadingAccount") : "Nothing saved yet"}
          body="Tap the heart on any book or audio book to keep it here."
          action={
            <Button asChild>
              <Link to="/library/books">Explore the library</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {list.map((i) => {
            const title = i.type === "Books" ? displayTitle(i.book, lang) : i.audio.titleEn;
            const author = i.type === "Books" ? displayAuthor(i.book, lang) : i.audio.authorEn;
            return (
              <li
                key={i.id}
                className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-5 py-5 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
              >
                {i.type === "Books" ? (
                  <BookThumb
                    book={{
                      ...i.book,
                      author: i.book.author ?? "",
                      is_circulating: i.book.is_circulating ?? true,
                      total_copies: i.book.total_copies ?? 0,
                      available_copies: i.book.available_copies ?? 0,
                    }}
                    fallbackTitle={title}
                    size="sm"
                  />
                ) : (
                  <Cover title={i.audio.titleBn} author="" tone={i.audio.tone} size="sm" />
                )}
                <div className="min-w-0">
                  <div className="eyebrow">{i.type}</div>
                  <div className="mt-1 truncate font-display text-xl">{title}</div>
                  <div className="truncate text-sm text-muted-foreground">{author}</div>
                </div>
                <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                  {i.type === "Audio Books" ? (
                    <Button size="sm" onClick={() => play(i.id)}>
                      Listen
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link to="/book/$id" params={{ id: i.id }}>
                        Borrow
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => toggleWish(i.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

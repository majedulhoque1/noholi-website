import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ComingSoonBanner } from "@/components/contribution-list";
import { Availability, BookCover, Cover, Empty } from "@/components/noholi";
import { audiobooks, getBook } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = ["All", "Books", "E-Books", "Audio Books"] as const;
export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "My wishlist \u2014 My Noholi" },
      {
        name: "description",
        content: "Your saved books, e-books and audio books from Noholi Library.",
      },
      { property: "og:title", content: "My wishlist \u2014 My Noholi" },
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

function Wishlist() {
  const { wishlist, toggleWish, play, t } = useApp();
  const { type: tab = "All" } = Route.useSearch();
  // Sample-data lookup only (wishlist is coming soon and empty); an id that matches nothing is skipped.
  const items = wishlist
    .map((id) => {
      const a = audiobooks.find((x) => x.id === id);
      if (a) return { id, type: "Audio Books" as const, a };
      const b = getBook(id);
      if (!b) return null;
      return { id, type: b.ebook ? ("E-Books" as const) : ("Books" as const), b };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);
  const list = items.filter((i) => tab === "All" || i.type === tab);

  return (
    <>
      <h1 className="text-4xl">Wishlist</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        Your private reading list. Want Noholi to buy a book?{" "}
        <Link to="/account/recommend" className="underline underline-offset-2">
          Recommend it instead
        </Link>
        .
      </p>
      <ComingSoonBanner className="mb-8" />
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            to="/account/wishlist"
            search={t === "All" ? {} : { type: t }}
            aria-current={tab === t ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-full border px-4 text-sm",
              tab === t ? "border-foreground bg-foreground text-background" : "border-border",
            )}
          >
            {t}{" "}
            <span className="opacity-60">
              {t === "All" ? items.length : items.filter((i) => i.type === t).length}
            </span>
          </Link>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty
          title={t("forms.soon.list")}
          body={t("forms.soon.wish")}
          action={
            <Button asChild>
              <Link to="/library/books">Explore the library</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {list.map((i) => (
            <li
              key={i.id}
              className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-5 py-5 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
            >
              {"a" in i && i.a ? (
                <Cover title={i.a.titleBn} author="" tone={i.a.tone} size="sm" />
              ) : (
                <BookCover book={i.b!} size="sm" />
              )}
              <div className="min-w-0">
                <div className="eyebrow">{i.type}</div>
                <div className="mt-1 truncate font-display text-xl">
                  {"a" in i && i.a ? i.a.titleEn : i.b!.titleEn}
                </div>
                <div className="truncate text-sm text-muted-foreground">
                  {"a" in i && i.a ? i.a.authorEn : i.b!.authorEn}
                </div>
                {i.type === "Books" && i.b && <Availability book={i.b} className="mt-1" />}
              </div>
              <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                {i.type === "Audio Books" && (
                  <Button size="sm" onClick={() => play(i.id)}>
                    Listen
                  </Button>
                )}
                {i.type === "E-Books" && (
                  <Button size="sm" asChild>
                    <Link to="/read/$id" params={{ id: i.id }}>
                      Read
                    </Link>
                  </Button>
                )}
                {i.type === "Books" && (
                  <Button size="sm" asChild>
                    <Link to="/book/$id" params={{ id: i.id }}>
                      Borrow
                    </Link>
                  </Button>
                )}
                {i.type !== "Audio Books" && (
                  <Button size="sm" variant="ghost" asChild>
                    <Link to="/book/$id" params={{ id: i.id }}>
                      View
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
          ))}
        </ul>
      )}
    </>
  );
}

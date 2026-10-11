import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveAvailability, LiveBookCard, LiveCover } from "@/components/catalog-bits";
import { MemberButton, reasons } from "@/components/member-gate";
import { WishButton } from "@/components/noholi";
import { BookReviewsSection } from "@/components/reviews";
import { SoonTag } from "@/components/soon-tag";
import {
  altAuthor,
  altTitle,
  bookAvailability,
  coverUrl,
  displayAuthor,
  displayTitle,
  fmtNum,
  getBook,
  hasBengali,
  normalizeBookId,
  searchBooks,
  type BookRow,
  type BookSearchRow,
} from "@/lib/books";
import { describeError } from "@/lib/supabase";
import { useApp } from "@/lib/store";

const same = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Up to four more books: the same author first, then the same genre (or category). */
async function loadRelated(book: BookRow): Promise<BookSearchRow[]> {
  const byAuthor = book.author
    ? searchBooks({ q: book.author, pageSize: 8 })
    : Promise.resolve({ rows: [] as BookSearchRow[], total: 0 });
  const filter = book.genre
    ? { genre: book.genre }
    : book.category
      ? { category: book.category }
      : null;
  const byGenre = filter
    ? searchBooks({ ...filter, pageSize: 8 })
    : Promise.resolve({ rows: [] as BookSearchRow[], total: 0 });
  const [a, g] = await Promise.all([byAuthor, byGenre]);
  const seen = new Set<string>([book.id]);
  const out: BookSearchRow[] = [];
  const authorRows = a.rows.filter(
    (r) => same(r.author, book.author) || same(r.author_bangla, book.author_bangla),
  );
  for (const r of [...authorRows, ...g.rows]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
    if (out.length === 4) break;
  }
  return out;
}

export const Route = createFileRoute("/book/$id")({
  loader: async ({ params }) => {
    const id = normalizeBookId(params.id);
    if (!id) throw notFound();
    const book = await getBook(id);
    if (!book) throw notFound();
    // The related shelf is a nicety: if it fails the book page still renders, with a quiet note.
    let related: BookSearchRow[] = [];
    let relatedError: string | null = null;
    try {
      related = await loadRelated(book);
    } catch (err) {
      relatedError = describeError(err);
    }
    return { book, related, relatedError };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const b = loaderData.book;
    const title = displayTitle(b, "en");
    const author = displayAuthor(b, "en");
    const description = [
      author ? `${title} by ${author}.` : `${title}.`,
      [b.publisher, b.year_of_publication].filter(Boolean).join(", "),
      "Borrow it free from Noholi Library, Dhaka.",
    ]
      .filter(Boolean)
      .join(" ");
    const image = coverUrl(b);
    return {
      meta: [
        { title: `${author ? `${title} by ${author}` : title} — Noholi Library` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — Noholi Library` },
        { property: "og:description", content: description },
        { property: "og:type", content: "book" },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      ],
    };
  },
  notFoundComponent: BookNotFound,
  errorComponent: BookError,
  component: BookPage,
});

function BookNotFound() {
  const { t } = useApp();
  return (
    <div className="container-page py-32 text-center">
      <h1 className="text-5xl">{t("catalog.bookNotFoundTitle")}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t("catalog.bookNotFoundBody")}</p>
      <Button className="mt-8" asChild>
        <Link to="/library/books">{t("catalog.browseLibrary")}</Link>
      </Button>
    </div>
  );
}

function BookError({ error }: ErrorComponentProps) {
  const { t } = useApp();
  const router = useRouter();
  console.error(error);
  return (
    <div className="container-page py-32 text-center" role="alert">
      <h1 className="text-5xl">{t("catalog.bookLoadErrorTitle")}</h1>
      <p className="mx-auto mt-3 max-w-md break-words text-muted-foreground">
        {describeError(error)}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => void router.invalidate()}>{t("catalog.tryAgain")}</Button>
        <Button variant="outline" asChild>
          <Link to="/library/books">{t("catalog.browseLibrary")}</Link>
        </Button>
      </div>
    </div>
  );
}

function BookPage() {
  const { book, related, relatedError } = Route.useLoaderData();
  const { t, lang, requireMember } = useApp();
  const nav = useNavigate();
  const a = bookAvailability(book);
  // The first sentence of the borrowing note reads like the reference's bold fee line.
  const noteMatch = /^(.*?[.।])\s*(.*)$/.exec(t("catalog.borrowNote"));
  const borrowFree = noteMatch ? noteMatch[1] : t("catalog.borrowNote");
  const borrowRest = noteMatch ? noteMatch[2] : "";

  const title = displayTitle(book, lang);
  const subTitle = altTitle(book, lang);
  const author = displayAuthor(book, lang);
  const subAuthor = altAuthor(book, lang);
  const onBorrow = () => nav({ to: "/account/borrow/$id", params: { id: book.id } });

  const meta: [string, string | number | null][] = [
    [t("catalog.filterGenre"), book.genre],
    [t("catalog.filterCategory"), book.category],
    [t("catalog.filterLanguage"), book.language],
    [t("catalog.labelPublisher"), book.publisher],
    [t("catalog.labelYear"), book.year_of_publication],
    [t("catalog.labelEdition"), book.edition],
    [t("catalog.labelIsbn"), book.isbn],
    [t("catalog.labelPages"), book.pages],
    [t("catalog.labelCondition"), book.condition],
    [
      t("catalog.labelCopies"),
      book.total_copies
        ? t("catalog.copiesOnShelf", {
            available: fmtNum(a.available, lang),
            total: fmtNum(a.total, lang),
          })
        : null,
    ],
    [t("catalog.labelBookNumber"), book.id],
  ];

  const notice =
    a.state === "reading"
      ? t("catalog.readingRoomNotice")
      : a.state === "loan"
        ? t("catalog.allOnLoanNotice")
        : t("catalog.noCopiesNotice");

  return (
    <>
      <div className="container-page pt-8">
        <Link
          to="/library/books"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t("catalog.backToLibrary")}
        </Link>
      </div>
      <section className="container-page grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="bg-secondary p-10 md:p-14">
            <LiveCover book={book} size="lg" eager className="mx-auto w-full max-w-[280px]" />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <div className="eyebrow mb-4 break-words">
            {[book.genre, book.category].filter(Boolean).join(" · ")}
          </div>
          <h1
            className={`break-words text-5xl leading-tight md:text-6xl ${hasBengali(title) ? "font-bangla" : ""}`}
          >
            {title}
          </h1>
          {subTitle && (
            <div
              className={`mt-2 break-words text-2xl text-muted-foreground ${hasBengali(subTitle) ? "font-bangla" : "font-display italic"}`}
            >
              {subTitle}
            </div>
          )}
          {author && (
            <div className="mt-5 break-words text-lg">
              {author}
              {subAuthor && (
                <span
                  className={
                    hasBengali(subAuthor)
                      ? "font-bangla text-muted-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {" "}
                  · {subAuthor}
                </span>
              )}
            </div>
          )}

          <div className="mt-8 border-y border-border py-5">
            {a.canBorrow ? (
              <LiveAvailability book={book} className="text-sm" />
            ) : (
              <div className="flex items-start gap-3">
                {a.state === "reading" ? (
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <LiveAvailability book={book} className="text-sm" />
                  <div className="mt-1 text-sm text-muted-foreground">{notice}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {a.canBorrow ? (
              <MemberButton size="lg" variant="accent" reason={reasons.borrow} onAllowed={onBorrow}>
                {t("catalog.borrow")}
              </MemberButton>
            ) : (
              <Button size="lg" disabled>
                {a.state === "reading" ? t("catalog.readingRoomBtn") : t("catalog.unavailableBtn")}
              </Button>
            )}
            <span className="ml-2 inline-flex items-center gap-2">
              <WishButton id={book.id} label />
              <SoonTag />
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <button
              type="button"
              onClick={() => requireMember(reasons.review, () => nav({ to: "/account/reviews" }))}
              className="underline underline-offset-4 hover:text-accent"
            >
              {t("ux.book.writeReview")}
            </button>
            <button
              type="button"
              onClick={() =>
                requireMember(reasons.recommend, () => nav({ to: "/account/recommend" }))
              }
              className="text-muted-foreground underline underline-offset-4 hover:text-accent"
            >
              {t("ux.book.recommend")}
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{borrowFree}</span>
            {borrowRest && ` ${borrowRest}`}{" "}
            <Link to="/library/rules" className="underline underline-offset-4 hover:text-accent">
              {t("catalog.rulesLink")}
            </Link>
          </p>

          <dl className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {meta.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-border py-3 text-sm"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="break-words tabular-nums">
                  {v === null || v === "" ? <span className="text-muted-foreground">—</span> : v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <BookReviewsSection />

      {(related.length > 0 || relatedError) && (
        <section className="container-page mt-10">
          <h2 className="mb-10 rule-top pt-5 text-3xl">{t("catalog.related")}</h2>
          {relatedError ? (
            <p role="alert" className="text-sm text-muted-foreground">
              {t("catalog.relatedError", { error: relatedError })}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
              {related.map((b) => (
                <LiveBookCard key={b.id} book={b} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

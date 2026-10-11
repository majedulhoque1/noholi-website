import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Availability, BookCard, BookCover, WishButton } from "@/components/noholi";
import { availability, books, getBook } from "@/lib/data";
import { MemberButton, reasons } from "@/components/member-gate";
import { ReviewsSection } from "@/components/reviews";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/book/$id")({
  loader: ({ params }) => {
    const book = getBook(params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.book.titleEn} by ${loaderData.book.authorEn} — Noholi Library` },
      { name: "description", content: loaderData.book.description },
      { property: "og:title", content: `${loaderData.book.titleEn} — Noholi Library` },
      { property: "og:description", content: loaderData.book.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="container-page py-32 text-center"><h1 className="text-5xl">Book not found</h1><p className="mt-3 text-muted-foreground">It may have been withdrawn from the catalogue.</p><Button className="mt-8" asChild><Link to="/library/books">Back to library</Link></Button></div>
  ),
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();
  const { borrowRequests, requireMember } = useApp();
  const nav = useNavigate();
  const a = availability(book);
  const pending = borrowRequests.find((r) => r.bookId === book.id && ["Pending Review", "Approved", "Ready for Pickup"].includes(r.status));
  const related = books.filter((b) => b.id !== book.id && (b.authorEn === book.authorEn || b.category === book.category)).slice(0, 4);
  const back = book.noholi ? "/library/noholi" : "/library/books";

  const meta: [string, string | number][] = [
    ["Genre", book.genre], ["Category", book.category], ["Language", book.language], ["Publisher", book.publisher],
    ["Year", book.year], ["Edition", book.edition], ["ISBN", book.isbn], ["Pages", book.pages],
    ["Condition", book.condition], ["Copies", `${book.availableCopies} of ${book.totalCopies} on shelf`],
  ];

  const onBorrow = () => nav({ to: "/account/borrow/$id", params: { id: book.id } });

  return (
    <>
      <div className="container-page pt-8"><Link to={back} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to {book.noholi ? "Noholi Books" : "Library"}</Link></div>
      <section className="container-page grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="bg-secondary p-10 md:p-14"><BookCover book={book} size="lg" className="mx-auto w-full max-w-[280px]" /></div>
        </div>
        <div className="lg:col-span-8">
          <div className="eyebrow mb-4">{book.noholi ? "Noholi Prokash" : book.genre} · {book.category}</div>
          <h1 className="font-bangla text-5xl leading-tight md:text-6xl">{book.titleBn}</h1>
          <div className="mt-2 font-display text-2xl italic text-muted-foreground">{book.titleEn}</div>
          <div className="mt-5 text-lg">{book.authorEn} <span className="font-bangla text-muted-foreground">· {book.authorBn}</span></div>

          <div className="mt-8 border-y border-border py-5">
            {a === "unavailable" ? (
              <div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><div className="font-medium">Currently unavailable</div><div className="text-sm text-muted-foreground">All {book.totalCopies} copies are currently borrowed. Save it to your wishlist and check back soon.</div></div></div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2"><Availability book={book} className="text-sm" /><span className="text-sm text-muted-foreground">Shelf mark: {book.language === "Bangla" ? "BN" : "EN"}-{book.genre === "Fiction" ? "F" : "NF"}-{book.year}</span></div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {pending ? (
              <Button size="lg" variant="outline" asChild><Link to="/account/requests"><Check /> Request {pending.id} · {pending.status}</Link></Button>
            ) : a === "unavailable" ? (
              <Button size="lg" disabled>Currently Unavailable</Button>
            ) : (
              <MemberButton size="lg" variant="accent" reason={reasons.borrow} onAllowed={onBorrow}>Borrow</MemberButton>
            )}
            {book.ebook && <Button size="lg" variant="outline" asChild><Link to="/read/$id" params={{ id: book.id }}>Read E-Book</Link></Button>}
            <WishButton id={book.id} label className="ml-2" />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <button type="button" onClick={() => document.getElementById("reviews-h")?.scrollIntoView({ behavior: "smooth" })} className="underline underline-offset-4 hover:text-accent">Write a Review</button>
            <button type="button" onClick={() => requireMember(reasons.recommend, () => nav({ to: "/account/recommend" }))} className="text-muted-foreground underline underline-offset-4 hover:text-accent">Recommend a Book to Noholi</button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground"><span className="font-medium text-foreground">Borrowing fee: ৳0.</span> Late return fines may apply according to library policy.</p>

          <p className="mt-10 max-w-2xl font-display text-xl leading-relaxed">{book.description}</p>

          <dl className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {meta.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-border py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="tabular-nums">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <ReviewsSection itemId={book.id} title={book.titleEn} />

      {related.length > 0 && (
        <section className="container-page mt-10">
          <h2 className="mb-10 rule-top pt-5 text-3xl">You might also borrow</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">{related.map((b) => <BookCard key={b.id} book={b} />)}</div>
        </section>
      )}

    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookCover, fmtDate, PageIntro, Stars } from "@/components/noholi";
import { WriteupNav } from "@/components/writeups";
import { articles, getBook } from "@/lib/data";

export const Route = createFileRoute("/writeups/reviews")({
  head: () => ({
    meta: [
      { title: "Book Reviews — Noholi Library" },
      { name: "description", content: "Honest reviews of Bangla and English books from Noholi's members." },
      { property: "og:title", content: "Noholi Book Reviews" },
      { property: "og:description", content: "Members review the books they borrowed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  const list = articles.filter((a) => a.kind === "review");
  const [lead, ...rest] = list;
  const lb = getBook(lead.bookId!)!;
  return (
    <>
      <PageIntro eyebrow="Write Ups / Book Reviews" title="Read it? Review it.">Members write about the books they borrowed — what stayed, what didn't, and who should read it next.</PageIntro>
      <WriteupNav />
      <section className="container-page">
        <Link to="/article/$slug" params={{ slug: lead.slug }} className="group grid gap-10 bg-secondary p-8 md:grid-cols-[200px_minmax(0,1fr)] md:p-14">
          <BookCover book={lb} className="w-40 md:w-full" />
          <div>
            <div className="eyebrow">Featured review · {lb.titleEn}</div>
            <h2 className="mt-4 text-4xl leading-tight group-hover:text-accent md:text-5xl">{lead.title}</h2>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{lead.excerpt}</p>
            <div className="mt-6 flex items-center gap-4 text-sm">{lead.author} · {fmtDate(lead.date)} <Stars n={lead.rating!} /></div>
          </div>
        </Link>
      </section>
      <section className="container-page mt-16 grid gap-x-10 gap-y-14 md:grid-cols-3">
        {rest.map((a) => {
          const bk = getBook(a.bookId!)!;
          return (
            <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group">
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-5 border-t border-foreground pt-6">
                <BookCover book={bk} size="sm" />
                <div className="min-w-0"><div className="eyebrow truncate">{bk.titleEn}</div><div className="mt-1 text-sm text-muted-foreground">{bk.authorEn}</div><div className="mt-2"><Stars n={a.rating!} /></div></div>
              </div>
              <h3 className="mt-5 text-2xl leading-snug group-hover:text-accent">{a.title}</h3>
              <p className="mt-2 text-muted-foreground">{a.excerpt}</p>
              <div className="mt-4 text-sm">{a.author} · <span className="underline underline-offset-4">Read review</span></div>
            </Link>
          );
        })}
      </section>
    </>
  );
}

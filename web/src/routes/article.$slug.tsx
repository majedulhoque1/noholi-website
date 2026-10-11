import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Facebook, Link2, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookCover, fmtDate, Stars } from "@/components/noholi";
import { ArticleRow, kindLabel, kindPath } from "@/components/writeups";
import { articles, getBook } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/article/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.article.title} — Noholi Write Ups` },
      { name: "description", content: loaderData.article.excerpt },
      { property: "og:title", content: loaderData.article.title },
      { property: "og:description", content: loaderData.article.excerpt },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ] : [],
  }),
  notFoundComponent: () => <div className="container-page py-32 text-center"><h1 className="text-5xl">Article not found</h1><Button className="mt-8" asChild><Link to="/writeups">Back to Write Ups</Link></Button></div>,
  component: ArticlePage,
});

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  const book = a.bookId ? getBook(a.bookId) : undefined;
  const related = articles.filter((x) => x.kind === a.kind && x.slug !== a.slug).slice(0, 3);
  const poem = a.kind === "creative" && a.sub === "Poetry";

  return (
    <article>
      <header className="container-page max-w-4xl pb-10 pt-12 text-center md:pt-20">
        <Link to={kindPath[a.kind]} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {kindLabel[a.kind]}s</Link>
        <div className="eyebrow mt-8">{kindLabel[a.kind]}{a.sub ? ` · ${a.sub}` : ""}</div>
        <h1 className={cn("mx-auto mt-5 max-w-3xl text-5xl leading-[1.05] md:text-7xl", a.bangla && "font-bangla leading-tight")}>{a.title}</h1>
        {!a.bangla && <p className="mx-auto mt-6 max-w-2xl font-display text-xl italic text-muted-foreground">{a.excerpt}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
          <span className="font-medium">{a.author}</span><span className="text-muted-foreground">· {fmtDate(a.date)} · {a.minutes} min read</span>
          {a.rating && <Stars n={a.rating} />}
        </div>
      </header>
      {a.image && <img src={a.image} alt="" className="photo mx-auto aspect-[21/9] w-full max-w-6xl object-cover" />}
      {book && (
        <div className="container-page max-w-2xl"><Link to="/book/$id" params={{ id: book.id }} className="mt-6 grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 border-y border-border py-4 hover:text-accent">
          <BookCover book={book} size="sm" /><div className="min-w-0"><div className="font-display text-lg">{book.titleEn}</div><div className="text-sm text-muted-foreground">{book.authorEn} · {book.year}</div></div><span className="text-sm underline underline-offset-4">Borrow</span></Link></div>
      )}
      <div className="container-page mt-12 grid max-w-5xl gap-10 md:grid-cols-[80px_minmax(0,1fr)]">
        <aside className="flex gap-3 md:sticky md:top-28 md:h-fit md:flex-col" aria-label="Share">
          <span className="eyebrow md:mb-1">Share</span>
          {[Facebook, Twitter].map((I, i) => <button key={i} onClick={() => toast("Share dialog would open here")} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-foreground" aria-label="Share"><I className="h-4 w-4" /></button>)}
          <button onClick={() => toast("Link copied")} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-foreground" aria-label="Copy link"><Link2 className="h-4 w-4" /></button>
        </aside>
        <div className={cn("max-w-[40rem]", poem ? "font-bangla text-2xl leading-[2]" : "prose-reading", a.bangla && !poem && "font-bangla")}>
          {a.body.map((p, i) => p.startsWith("> ")
            ? <blockquote key={i}>{p.slice(2)}</blockquote>
            : <p key={i} className={cn(poem && "mb-10 whitespace-pre-line")}>{p}</p>)}
          <div className="mt-14 border-t border-border pt-6 font-sans text-sm text-muted-foreground">Written by <span className="text-foreground">{a.author}</span> for Noholi Write Ups.</div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="container-page mt-24">
          <h2 className="rule-top pt-5 text-3xl">More {kindLabel[a.kind].toLowerCase()}s</h2>
          {related.map((r) => <ArticleRow key={r.slug} a={r} />)}
        </section>
      )}
    </article>
  );
}

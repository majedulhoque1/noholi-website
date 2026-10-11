import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BookCover, Empty, fmtDate, Stars } from "@/components/noholi";
import { getBook, type Article } from "@/lib/data";
import { cn } from "@/lib/utils";

export const kindLabel = { blog: "Blog", creative: "Creative Writing", review: "Book Review" } as const;
export const kindPath = { blog: "/writeups/blogs", creative: "/writeups/creative", review: "/writeups/reviews" } as const;

export function WriteupNav() {
  const items = [["/writeups", "All"], ["/writeups/blogs", "Blogs"], ["/writeups/creative", "Creative Writings"], ["/writeups/reviews", "Book Reviews"]] as const;
  return (
    <nav className="container-page mb-12 flex gap-6 overflow-x-auto border-b border-border" aria-label="Write Ups sections">
      {items.map(([to, l]) => (
        <Link key={to} to={to} activeOptions={{ exact: true }} className="-mb-px whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-muted-foreground hover:text-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground">{l}</Link>
      ))}
    </nav>
  );
}

export function FeatureArticle({ a }: { a: Article }) {
  const book = a.bookId ? getBook(a.bookId) : undefined;
  return (
    <Link to="/article/$slug" params={{ slug: a.slug }} className="group grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        {a.image ? <img src={a.image} alt="" className="photo aspect-[16/10] w-full object-cover" />
          : book ? <div className="grid aspect-[16/10] place-items-center bg-secondary"><BookCover book={book} className="w-40" /></div>
          : <div className="grid aspect-[16/10] place-items-center bg-secondary p-10"><p className="whitespace-pre-line text-center font-bangla text-3xl italic leading-relaxed">{a.excerpt}</p></div>}
      </div>
      <div className="lg:col-span-5">
        <div className="eyebrow">{kindLabel[a.kind]}{a.sub ? ` · ${a.sub}` : ""}</div>
        <h2 className={cn("mt-4 text-4xl leading-tight group-hover:text-accent md:text-5xl", a.bangla && "font-bangla")}>{a.title}</h2>
        <p className={cn("mt-5 text-lg leading-relaxed text-muted-foreground", a.bangla && "whitespace-pre-line font-bangla")}>{a.excerpt}</p>
        <div className="mt-6 text-sm">{a.author} · {fmtDate(a.date)} · {a.minutes} min read</div>
      </div>
    </Link>
  );
}

export function ArticleRow({ a }: { a: Article }) {
  const book = a.bookId ? getBook(a.bookId) : undefined;
  return (
    <Link to="/article/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[minmax(0,1fr)_96px] gap-6 border-b border-border py-8 md:grid-cols-[140px_minmax(0,1fr)_160px]">
      <div className="hidden text-sm text-muted-foreground md:block">{fmtDate(a.date)}<div className="eyebrow mt-2">{kindLabel[a.kind]}</div></div>
      <div className="min-w-0">
        <div className="eyebrow md:hidden">{kindLabel[a.kind]}</div>
        <h3 className={cn("mt-1 text-2xl leading-snug group-hover:text-accent md:mt-0 md:text-3xl", a.bangla && "font-bangla")}>{a.title}</h3>
        <p className={cn("mt-2 line-clamp-2 text-muted-foreground", a.bangla && "whitespace-pre-line font-bangla")}>{a.excerpt}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">{a.author} <span className="text-muted-foreground">· {a.minutes} min</span>{a.rating && <Stars n={a.rating} />}</div>
      </div>
      {a.image ? <img src={a.image} alt="" loading="lazy" className="photo aspect-square w-full object-cover md:aspect-[4/3]" />
        : book ? <BookCover book={book} size="sm" className="w-full max-w-[96px] justify-self-end" />
        : <div className="grid aspect-square place-items-center bg-secondary font-bangla text-4xl text-accent md:aspect-[4/3]">“</div>}
    </Link>
  );
}

export function ArticleList({ list }: { list: Article[] }) {
  const [q, setQ] = useState("");
  const res = list.filter((a) => !q || (a.title + a.excerpt + a.author).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 rule-top pt-5">
        <h2 className="text-3xl">Latest</h2>
        <div className="relative w-48 sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search writing" className="h-10 rounded-none pl-10" aria-label="Search writing" /></div>
      </div>
      {res.length ? res.map((a) => <ArticleRow key={a.slug} a={a} />) : <div className="mt-8"><Empty title="Nothing found" body="No pieces match that search yet." /></div>}
    </div>
  );
}

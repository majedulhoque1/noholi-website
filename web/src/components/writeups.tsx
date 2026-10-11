import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BookCover, Empty, fmtDate, Stars } from "@/components/noholi";
import { getBook, type Article } from "@/lib/data";
import { cn } from "@/lib/utils";

export const kindLabel = {
  blog: "Blog",
  creative: "Creative Writing",
  review: "Book Review",
} as const;
export const kindPath = {
  blog: "/writeups/blogs",
  creative: "/writeups/creative",
  review: "/writeups/reviews",
} as const;

export function WriteupNav() {
  const items = [
    ["/writeups", "All"],
    ["/writeups/blogs", "Blogs"],
    ["/writeups/creative", "Creative Writings"],
    ["/writeups/reviews", "Book Reviews"],
  ] as const;
  return (
    <nav
      className="container-page mb-12 flex gap-6 overflow-x-auto border-b border-border"
      aria-label="Write Ups sections"
    >
      {items.map(([to, l]) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: true }}
          className="-mb-px whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-muted-foreground hover:text-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground"
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}

/**
 * The picture slot of a write-up. A photo when the piece has one; otherwise a designed
 * placeholder, never an empty box: a review shows its book on a lit backdrop, and other
 * pieces set their opening lines as type.
 */
function ArticleMedia({
  a,
  className,
  feature,
}: {
  a: Article;
  className?: string;
  feature?: boolean;
}) {
  const book = a.bookId ? getBook(a.bookId) : undefined;
  const frame = cn("relative overflow-hidden bg-secondary", className);
  if (a.image) {
    return (
      <div className={frame}>
        <img
          src={a.image}
          alt=""
          loading={feature ? undefined : "lazy"}
          className="photo absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }
  if (book) {
    return (
      <div className={cn(frame, "grid place-items-center")}>
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,var(--background)_0%,transparent_68%)] opacity-70"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[22%] border-t border-foreground/10 bg-foreground/[0.04]"
        />
        <BookCover
          book={book}
          size={feature ? "md" : "sm"}
          className={cn(
            "relative shadow-[0_18px_30px_-12px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:-rotate-1",
            feature ? "w-[34%] max-w-52" : "w-[30%] max-w-36",
          )}
        />
      </div>
    );
  }
  return (
    <div
      className={cn(frame, "flex flex-col justify-center", feature ? "p-10 md:p-14" : "p-7 lg:p-9")}
    >
      <span
        aria-hidden
        className={cn(
          "block select-none font-display leading-[0.5] text-accent/50",
          feature ? "mb-6 text-8xl" : "mb-4 text-6xl",
        )}
      >
        “
      </span>
      <p
        className={cn(
          "shrink-0 whitespace-pre-line italic text-foreground/85",
          a.bangla ? "font-bangla" : "font-display",
          feature
            ? "line-clamp-5 text-2xl leading-relaxed md:text-3xl"
            : "line-clamp-3 text-lg leading-relaxed md:text-xl",
        )}
      >
        {a.excerpt}
      </p>
      {feature && <div className="eyebrow mt-6">{a.author}</div>}
    </div>
  );
}

export function FeatureArticle({ a }: { a: Article }) {
  return (
    <Link
      to="/article/$slug"
      params={{ slug: a.slug }}
      className="group grid gap-8 lg:grid-cols-12 lg:items-center"
    >
      <div className="lg:col-span-7">
        <ArticleMedia a={a} feature className="aspect-[16/10]" />
      </div>
      <div className="lg:col-span-5">
        <div className="eyebrow">
          {kindLabel[a.kind]}
          {a.sub ? ` · ${a.sub}` : ""}
        </div>
        <h2
          className={cn(
            "mt-4 text-4xl leading-tight group-hover:text-accent md:text-5xl",
            a.bangla && "font-bangla",
          )}
        >
          {a.title}
        </h2>
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-muted-foreground",
            a.bangla && "whitespace-pre-line font-bangla",
          )}
        >
          {a.excerpt}
        </p>
        <div className="mt-6 text-sm">
          {a.author} · {fmtDate(a.date)} · {a.minutes} min read
        </div>
      </div>
    </Link>
  );
}

export function ArticleRow({ a }: { a: Article }) {
  return (
    <Link
      to="/article/$slug"
      params={{ slug: a.slug }}
      className="group grid gap-6 border-b border-border py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-10 lg:gap-14"
    >
      <ArticleMedia a={a} className="aspect-[16/10] md:aspect-[3/2]" />
      <div className="min-w-0">
        <div className="eyebrow">
          {kindLabel[a.kind]}
          {a.sub ? ` · ${a.sub}` : ""}
          <span className="text-muted-foreground/70"> · {fmtDate(a.date)}</span>
        </div>
        <h3
          className={cn(
            "mt-3 text-2xl leading-snug group-hover:text-accent md:text-[2rem]",
            a.bangla && "font-bangla",
          )}
        >
          {a.title}
        </h3>
        <p
          className={cn(
            "mt-3 line-clamp-3 leading-relaxed text-muted-foreground",
            a.bangla && "whitespace-pre-line font-bangla",
          )}
        >
          {a.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          {a.author} <span className="text-muted-foreground">· {a.minutes} min read</span>
          {a.rating && <Stars n={a.rating} />}
          <span className="ml-auto hidden text-sm font-medium transition-transform group-hover:translate-x-1 group-hover:text-accent md:inline">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleList({ list }: { list: Article[] }) {
  const [q, setQ] = useState("");
  const res = list.filter(
    (a) => !q || (a.title + a.excerpt + a.author).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 rule-top pt-5">
        <h2 className="text-3xl">Latest</h2>
        <div className="relative w-48 sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search writing"
            className="h-10 rounded-none pl-10"
            aria-label="Search writing"
          />
        </div>
      </div>
      {res.length ? (
        res.map((a) => <ArticleRow key={a.slug} a={a} />)
      ) : (
        <div className="mt-8">
          <Empty title="Nothing found" body="No pieces match that search yet." />
        </div>
      )}
    </div>
  );
}

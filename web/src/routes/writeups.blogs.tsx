import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContributePanel } from "@/components/contribute-panel";
import { Empty, fmtDate } from "@/components/noholi";
import { ArticleMedia } from "@/components/writeups";
import { articles, type Article } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/writeups/blogs")({
  head: () => ({
    meta: [
      { title: "Blogs — Noholi Library" },
      {
        name: "description",
        content: "Library news, essays and notes on reading culture from Noholi.",
      },
      { property: "og:title", content: "Noholi Blogs" },
      { property: "og:description", content: "Essays and library news from Noholi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Blogs,
});

const PAGE_SIZE = 9;

function BlogCard({ a, lead }: { a: Article; lead?: boolean }) {
  return (
    <Link
      to="/article/$slug"
      params={{ slug: a.slug }}
      className={cn("group flex min-w-0 flex-col", lead && "lg:col-span-2")}
    >
      <ArticleMedia a={a} feature={lead} className={lead ? "aspect-[16/9]" : "aspect-[3/2]"} />
      <div className="mt-4 flex min-w-0 flex-1 flex-col">
        <div className="text-sm text-muted-foreground">
          {a.author} · {fmtDate(a.date)}
        </div>
        <h3
          className={cn(
            "mt-2 leading-snug group-hover:text-accent",
            lead ? "text-2xl md:text-3xl" : "text-xl",
            a.bangla && "font-bangla",
          )}
        >
          {a.title}
        </h3>
        <p
          className={cn(
            "mt-2 line-clamp-3 leading-relaxed text-muted-foreground",
            a.bangla && "font-bangla",
          )}
        >
          {a.excerpt}
        </p>
        {a.sub && (
          <div className="mt-4">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {a.sub}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function Blogs() {
  // Published blogs only, newest first. There is no "featured" flag in the data yet, so the
  // featured area simply shows the three most recent posts; confirm a selection rule with Noholi.
  const list = articles
    .filter((a) => a.kind === "blog")
    .sort((a, b) => b.date.localeCompare(a.date));
  const featured = list.slice(0, 3);
  const rest = list.slice(3);
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const shown = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <header className="container-page px-5 pb-10 pt-12 text-center md:pb-14 md:pt-16">
        <div className="eyebrow mb-4">Blogs</div>
        <h1 className="mx-auto max-w-2xl text-4xl leading-tight md:text-5xl">
          Stories, ideas &amp; perspectives.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Explore thoughts, discoveries, reading experiences and ideas shared by the Noholi
          community.
        </p>
      </header>
      {list.length === 0 ? (
        <section className="container-page">
          <Empty title="No blogs yet" body="Published blog posts will appear here." />
        </section>
      ) : (
        <>
          <section className="container-page" aria-label="Featured stories">
            <div className="grid gap-8 lg:grid-cols-4">
              {featured.map((a, i) => (
                <BlogCard key={a.slug} a={a} lead={i === 0} />
              ))}
            </div>
          </section>
          {rest.length > 0 && (
            <section className="container-page mt-16" aria-labelledby="all-stories">
              <h2 id="all-stories" className="rule-top pt-5 text-2xl md:text-3xl">
                All stories
              </h2>
              <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((a) => (
                  <BlogCard key={a.slug} a={a} />
                ))}
              </div>
              {pages > 1 && (
                <nav
                  className="mt-12 flex items-center justify-center gap-4"
                  aria-label="Blog pages"
                >
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground" aria-current="page">
                    Page {page} of {pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </section>
          )}
        </>
      )}
      <ContributePanel />
    </>
  );
}

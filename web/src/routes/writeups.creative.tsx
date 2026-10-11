import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/noholi";
import { WriteupNav } from "@/components/writeups";
import { articles } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/writeups/creative")({
  head: () => ({
    meta: [
      { title: "Creative Writings — Poetry & stories | Noholi" },
      { name: "description", content: "Poetry, short stories and essays by Noholi members and writers." },
      { property: "og:title", content: "Noholi Creative Writings" },
      { property: "og:description", content: "Poems, stories and lyric essays from the Noholi community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Creative,
});

function Creative() {
  const list = articles.filter((a) => a.kind === "creative");
  return (
    <>
      <PageIntro eyebrow="Write Ups / Creative Writings" title={<>Poems, stories, <em>small fires.</em></>}>New work by members and visiting writers, in Bangla and English. Submissions open every quarter.</PageIntro>
      <WriteupNav />
      <section className="container-page grid gap-px bg-border md:grid-cols-2">
        {list.map((a, i) => (
          <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className={cn("group flex min-h-[420px] flex-col justify-between bg-background p-8 md:p-12", i === 0 && "md:col-span-2 md:min-h-[460px]")}>
            <div className="flex items-center justify-between"><span className="eyebrow">{a.sub}</span><span className="text-xs text-muted-foreground">{a.minutes} min</span></div>
            {a.bangla ? (
              <p className={cn("my-10 whitespace-pre-line font-bangla italic leading-relaxed text-muted-foreground", i === 0 ? "text-3xl md:text-4xl" : "text-2xl")}>{a.excerpt}</p>
            ) : (
              <p className={cn("my-10 font-display italic leading-snug text-muted-foreground", i === 0 ? "text-3xl" : "text-2xl")}>“{a.excerpt}”</p>
            )}
            <div>
              <h2 className={cn("text-3xl group-hover:text-accent md:text-4xl", a.bangla && "font-bangla")}>{a.title}</h2>
              <div className="mt-2 text-sm">{a.author}</div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

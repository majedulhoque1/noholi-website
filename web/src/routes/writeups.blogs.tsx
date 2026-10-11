import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/noholi";
import { ArticleList, FeatureArticle, WriteupNav } from "@/components/writeups";
import { articles } from "@/lib/data";

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
  component: () => {
    const list = articles.filter((a) => a.kind === "blog");
    return (
      <>
        <PageIntro eyebrow="Write Ups / Blogs" title="The Noholi blog.">
          News from the library, essays on reading, and the occasional complaint about
          load-shedding.
        </PageIntro>
        <WriteupNav />
        <section className="container-page">
          <FeatureArticle a={list[0]} />
        </section>
        <section className="container-page mt-20">
          <ArticleList list={list.slice(1)} />
        </section>
      </>
    );
  },
});

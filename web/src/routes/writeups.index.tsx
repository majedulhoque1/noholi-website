import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MemberButton, reasons } from "@/components/member-gate";
import { PageIntro } from "@/components/noholi";
import { ArticleList, FeatureArticle, WriteupNav } from "@/components/writeups";
import { articles } from "@/lib/data";

export const Route = createFileRoute("/writeups/")({
  head: () => ({
    meta: [
      { title: "Write Ups — Blogs, creative writing and reviews | Noholi" },
      {
        name: "description",
        content: "Essays, poems, stories and book reviews from Noholi's readers and writers.",
      },
      { property: "og:title", content: "Noholi Write Ups" },
      {
        property: "og:description",
        content: "Blogs, creative writing and book reviews from the Noholi community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Writeups,
});

function Writeups() {
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const nav = useNavigate();
  const go = (type: "blog" | "creative" | "review") => () =>
    nav({ to: "/account/contribute", search: { type } });
  return (
    <>
      <PageIntro
        eyebrow="Write Ups · লেখালেখি"
        title={
          <>
            Writing from <em className="text-accent">the reading room.</em>
          </>
        }
        aside={
          <div className="border-l-2 border-accent pl-6 md:w-[320px]" aria-labelledby="share-h">
            <div className="eyebrow">Contribute to Noholi</div>
            <h2 id="share-h" className="mt-2 text-2xl leading-snug">
              Become part of the community.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Members can share essays, poems, stories and reviews. Editors read every piece first.
            </p>
            <div className="mt-5 grid gap-2">
              <MemberButton
                reason={reasons.contribute}
                onAllowed={go("blog")}
                className="justify-start"
              >
                Submit a Blog
              </MemberButton>
              <MemberButton
                reason={reasons.contribute}
                onAllowed={go("creative")}
                variant="outline"
                className="justify-start"
              >
                Submit Creative Writing
              </MemberButton>
              <MemberButton
                reason={reasons.review}
                onAllowed={go("review")}
                variant="outline"
                className="justify-start"
              >
                Write a Book Review
              </MemberButton>
            </div>
          </div>
        }
      >
        Read what the Noholi community writes — blogs by our librarians, poems and stories from
        members, and honest reviews of the books on our shelves.
      </PageIntro>
      <WriteupNav />
      <section className="container-page">
        <FeatureArticle a={sorted[0]} />
      </section>
      <section className="container-page mt-20 grid gap-6 border-y border-border py-10 md:grid-cols-3">
        {(
          [
            ["/writeups/blogs", "Blogs", "Library news, essays and reading culture."],
            ["/writeups/creative", "Creative Writings", "Poetry, short stories and lyric essays."],
            ["/writeups/reviews", "Book Reviews", "Members on the books they borrowed."],
          ] as const
        ).map(([to, t, d]) => (
          <Link key={to} to={to} className="group">
            <h3 className="text-2xl group-hover:text-accent">{t} →</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Link>
        ))}
      </section>
      <section className="container-page mt-16">
        <ArticleList list={sorted.slice(1)} />
      </section>
    </>
  );
}

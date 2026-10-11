import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cover, WishButton } from "@/components/noholi";
import { ReviewsSection } from "@/components/reviews";
import { audiobooks, fmtDuration } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/audio/$id")({
  loader: ({ params }) => { const a = audiobooks.find((x) => x.id === params.id); if (!a) throw notFound(); return { a }; },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.a.titleEn} — Audio Book | Noholi Library` },
      { name: "description", content: loaderData.a.description },
      { property: "og:title", content: `${loaderData.a.titleEn} — Noholi Audio Books` },
      { property: "og:description", content: loaderData.a.description },
      { property: "og:type", content: "music.song" },
      { name: "twitter:card", content: "summary" },
    ] : [{ title: "Audio book not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <div className="container-page py-32 text-center"><h1 className="text-5xl">Audio book not found</h1><Button className="mt-8" asChild><Link to="/library/audio">Back to Audio Books</Link></Button></div>,
  component: AudioPage,
});

function AudioPage() {
  const { a } = Route.useLoaderData();
  const { play, player } = useApp();
  const playing = player.track?.id === a.id && player.playing;
  const related = audiobooks.filter((x) => x.id !== a.id).slice(0, 4);
  return (
    <>
      <div className="container-page pt-8"><Link to="/library/audio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Audio Books</Link></div>
      <section className="container-page grid gap-12 pb-10 pt-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4"><div className="bg-secondary p-10 md:p-14"><Cover title={a.titleBn} author={a.authorEn} tone={a.tone} size="lg" className="mx-auto w-full max-w-[280px]" /></div></div>
        <div className="lg:col-span-8">
          <div className="eyebrow mb-4">Audio Book · {a.genre}</div>
          <h1 className="text-5xl leading-tight md:text-6xl">{a.titleEn}</h1>
          <div className="mt-2 font-bangla text-2xl text-muted-foreground">{a.titleBn}</div>
          <div className="mt-5 text-lg">{a.authorEn} <span className="text-muted-foreground">· read by {a.narrator}</span></div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="accent" onClick={() => play(a.id)}>{playing ? <><Pause /> Pause</> : <><Play /> Listen</>}</Button>
            <WishButton id={a.id} label className="ml-2" />
            <button type="button" onClick={() => document.getElementById("reviews-h")?.scrollIntoView({ behavior: "smooth" })} className="ml-2 text-sm underline underline-offset-4 hover:text-accent">Write a Review</button>
          </div>
          <p className="mt-10 max-w-2xl font-display text-xl leading-relaxed">{a.description}</p>
          <dl className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {[["Narrator", a.narrator], ["Duration", fmtDuration(a.duration)], ["Language", a.language], ["Genre", a.genre], ["Chapters", a.chapters.length]].map(([k, v]) => (
              <div key={k as string} className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-border py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>
      <ReviewsSection itemId={a.id} title={a.titleEn} />
      <section className="container-page mt-16">
        <h2 className="mb-8 rule-top pt-5 text-3xl">More to listen to</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{related.map((x) => <Link key={x.id} to="/audio/$id" params={{ id: x.id }} className="group"><Cover title={x.titleBn} author={x.authorEn} tone={x.tone} /><div className="mt-3 font-display text-lg group-hover:text-accent">{x.titleEn}</div><div className="text-sm text-muted-foreground">{fmtDuration(x.duration)}</div></Link>)}</div>
      </section>
    </>
  );
}

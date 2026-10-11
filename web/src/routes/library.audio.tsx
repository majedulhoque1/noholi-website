import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pause, Play, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cover, Empty, PageIntro, WishButton } from "@/components/noholi";
import { audiobooks, fmtDuration } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library/audio")({
  head: () => ({
    meta: [
      { title: "Audio Books — Listen at Noholi" },
      { name: "description", content: "Studio-recorded Bangla and English audio books, including Noholi originals read by their authors." },
      { property: "og:title", content: "Noholi Audio Books" },
      { property: "og:description", content: "Listen to classics and Noholi originals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AudioPage,
});

function AudioPage() {
  const { t, play, player } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(audiobooks.map((a) => a.genre)))];
  const res = useMemo(() => audiobooks.filter((a) => (cat === "All" || a.genre === cat) && (!q || (a.titleEn + a.titleBn + a.authorEn).toLowerCase().includes(q.toLowerCase()))), [q, cat]);
  const lead = audiobooks[6];
  const isPlaying = (id: string) => player.track?.id === id && player.playing;

  return (
    <>
      <PageIntro eyebrow={`${t("library")} / ${t("audiobooks")}`} title="Listen closely.">Recorded in our own small studio, by actors, poets and — sometimes — the writers themselves.</PageIntro>
      <section className="container-page">
        <div className="grid gap-10 border border-foreground p-8 md:grid-cols-[220px_minmax(0,1fr)] md:p-12">
          <Cover title={lead.titleBn} author={lead.authorEn} tone={lead.tone} noholi className="w-48 md:w-full" />
          <div className="flex flex-col justify-center">
            <div className="eyebrow mb-3">Noholi original · read by the author</div>
            <h2 className="text-4xl md:text-5xl">{lead.titleEn}</h2>
            <div className="mt-1 font-bangla text-xl text-muted-foreground">{lead.titleBn}</div>
            <p className="mt-5 max-w-lg text-muted-foreground">{lead.description}</p>
            <div className="mt-8 flex items-center gap-5">
              <Button size="lg" variant="accent" onClick={() => play(lead.id)}>{isPlaying(lead.id) ? <><Pause /> Pause</> : <><Play /> Play · {fmtDuration(lead.duration)}</>}</Button>
              <WishButton id={lead.id} label />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">{cats.map((c) => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("h-8 rounded-full border px-3 text-sm", cat === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50")}>{c}</button>)}</div>
          <div className="relative lg:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search audio books" className="h-10 rounded-none pl-10" aria-label="Search audio books" /></div>
        </div>

        {res.length ? (
          <ul className="mt-8 border-t border-foreground">
            {res.map((a, i) => (
              <li key={a.id} className={cn("grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-5 md:grid-cols-[32px_64px_minmax(0,1.3fr)_minmax(0,1fr)_120px_auto] md:gap-6", isPlaying(a.id) && "bg-muted/60")}>
                <span className="hidden font-display text-muted-foreground md:block">{String(i + 1).padStart(2, "0")}</span>
                <Cover title={a.titleBn} author="" tone={a.tone} size="sm" />
                <div className="min-w-0"><Link to="/audio/$id" params={{ id: a.id }} className="block truncate font-display text-xl hover:text-accent">{a.titleEn}</Link><div className="truncate text-sm text-muted-foreground">{a.authorEn} · {a.language}</div><div className="mt-1 text-xs text-muted-foreground md:hidden">{fmtDuration(a.duration)}</div></div>
                <p className="hidden text-sm text-muted-foreground md:line-clamp-2">{a.description}</p>
                <span className="hidden text-sm tabular-nums text-muted-foreground md:block">{fmtDuration(a.duration)}</span>
                <div className="flex items-center gap-3">
                  <WishButton id={a.id} className="hidden text-muted-foreground sm:inline-flex" />
                  <button onClick={() => play(a.id)} aria-label={isPlaying(a.id) ? "Pause" : `Play ${a.titleEn}`} className={cn("grid h-11 w-11 place-items-center rounded-full border transition-colors", isPlaying(a.id) ? "border-accent bg-accent text-accent-foreground" : "border-foreground/30 hover:bg-foreground hover:text-background")}>
                    {isPlaying(a.id) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : <div className="mt-8"><Empty title="Nothing to listen to here" body="No audio books match that search." /></div>}
      </section>
    </>
  );
}

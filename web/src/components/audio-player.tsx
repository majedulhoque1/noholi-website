import { ChevronDown, ListMusic, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { Cover } from "@/components/noholi";
import { Slider } from "@/components/ui/slider";
import { audiobooks, fmtTime } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const speeds = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer() {
  const { player, togglePlay, seek, skip, setSpeed, setVolume, setExpanded, next, prev, closePlayer, play } = useApp();
  const tr = player.track;
  if (!tr) return null;
  const pct = (player.pos / tr.duration) * 100;
  const cycleSpeed = () => setSpeed(speeds[(speeds.indexOf(player.speed) + 1) % speeds.length]);
  const PlayBtn = ({ big }: { big?: boolean }) => (
    <button onClick={togglePlay} aria-label={player.playing ? "Pause" : "Play"}
      className={cn("grid place-items-center rounded-full bg-foreground text-background transition-transform active:scale-95", big ? "h-16 w-16" : "h-10 w-10")}>
      {player.playing ? <Pause className={big ? "h-6 w-6" : "h-4 w-4"} /> : <Play className={cn("translate-x-px", big ? "h-6 w-6" : "h-4 w-4")} />}
    </button>
  );

  if (player.expanded) {
    const queue = audiobooks.filter((a) => a.id !== tr.id).slice(0, 4);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background animate-in slide-in-from-bottom duration-300" role="dialog" aria-label="Audio player">
        <div className="container-page flex items-center justify-between py-5">
          <button onClick={() => setExpanded(false)} className="inline-flex items-center gap-2 text-sm"><ChevronDown className="h-5 w-5" /> Minimise</button>
          <div className="eyebrow">Now listening</div>
          <button onClick={closePlayer} aria-label="Close player"><X className="h-5 w-5" /></button>
        </div>
        <div className="container-page grid gap-12 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="mx-auto w-full max-w-xl text-center">
            <Cover title={tr.titleBn} author={tr.authorEn} tone={tr.tone} size="lg" className="mx-auto w-56 md:w-72" />
            <h2 className="mt-10 text-4xl">{tr.titleEn}</h2>
            <p className="mt-2 text-muted-foreground">{tr.authorEn} · read by {tr.narrator}</p>
            <div className="mt-10">
              <Slider value={[player.pos]} max={tr.duration} step={1} onValueChange={(v) => seek(v[0])} aria-label="Seek" />
              <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground"><span>{fmtTime(player.pos)}</span><span>-{fmtTime(tr.duration - player.pos)}</span></div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-5 md:gap-7">
              <button onClick={prev} aria-label="Previous"><SkipBack className="h-5 w-5" /></button>
              <button onClick={() => skip(-15)} aria-label="Back 15 seconds" className="relative"><RotateCcw className="h-7 w-7" /><span className="absolute inset-0 grid place-items-center pt-0.5 text-[0.55rem] font-semibold">15</span></button>
              <PlayBtn big />
              <button onClick={() => skip(30)} aria-label="Forward 30 seconds" className="relative"><RotateCw className="h-7 w-7" /><span className="absolute inset-0 grid place-items-center pt-0.5 text-[0.55rem] font-semibold">30</span></button>
              <button onClick={next} aria-label="Next"><SkipForward className="h-5 w-5" /></button>
            </div>
            <div className="mx-auto mt-10 flex max-w-sm items-center gap-6">
              <button onClick={cycleSpeed} className="h-8 rounded-full border border-border px-3 text-xs tabular-nums">{player.speed}×</button>
              <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Slider value={[player.volume * 100]} max={100} onValueChange={(v) => setVolume(v[0] / 100)} aria-label="Volume" />
            </div>
          </div>
          <aside>
            <div className="eyebrow mb-4">Chapters</div>
            <ol className="divide-y divide-border border-y border-border">
              {tr.chapters.map((c, i) => (
                <li key={c}><button onClick={() => seek(Math.floor((tr.duration / tr.chapters.length) * i))} className="flex w-full items-center gap-4 py-3 text-left hover:text-accent">
                  <span className="w-5 text-xs text-muted-foreground">{i + 1}</span><span className="font-display text-lg">{c}</span></button></li>
              ))}
            </ol>
            <div className="eyebrow mb-4 mt-10 flex items-center gap-2"><ListMusic className="h-3.5 w-3.5" /> Up next</div>
            <ul className="space-y-4">
              {queue.map((a) => (
                <li key={a.id}><button onClick={() => play(a.id)} className="grid w-full grid-cols-[40px_minmax(0,1fr)] items-center gap-3 text-left hover:text-accent">
                  <Cover title={a.titleBn} author="" tone={a.tone} size="sm" />
                  <span className="min-w-0"><span className="block truncate font-display">{a.titleEn}</span><span className="block truncate text-xs text-muted-foreground">{a.authorEn}</span></span>
                </button></li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur animate-in slide-in-from-bottom duration-300">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-border"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
      <div className="container-page grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <button onClick={() => setExpanded(true)} className="grid min-w-0 grid-cols-[36px_minmax(0,1fr)] items-center gap-3 text-left">
          <Cover title={tr.titleBn} author="" tone={tr.tone} size="sm" />
          <span className="min-w-0"><span className="block truncate font-display text-base">{tr.titleEn}</span><span className="block truncate text-xs text-muted-foreground">{tr.authorEn} · {fmtTime(player.pos)} / {fmtTime(tr.duration)}</span></span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => skip(-10)} aria-label="Back 10 seconds" className="hidden sm:block"><RotateCcw className="h-5 w-5" /></button>
          <PlayBtn />
          <button onClick={() => skip(30)} aria-label="Forward 30 seconds" className="hidden sm:block"><RotateCw className="h-5 w-5" /></button>
        </div>
        <div className="hidden items-center justify-end gap-4 md:flex">
          <button onClick={cycleSpeed} className="h-7 rounded-full border border-border px-2.5 text-xs tabular-nums">{player.speed}×</button>
          <button onClick={() => setExpanded(true)} className="text-sm underline underline-offset-4">Open player</button>
          <button onClick={closePlayer} aria-label="Close player" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

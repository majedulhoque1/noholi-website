import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, List, Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getBook, readerChapters } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/read/$id")({
  loader: ({ params }) => {
    const book = getBook(params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `Reading ${loaderData.book.titleEn} — Noholi E-Reader` },
      { name: "description", content: `Read ${loaderData.book.titleEn} in Noholi's online reader.` },
      { property: "og:title", content: `${loaderData.book.titleEn} — Noholi E-Reader` },
      { property: "og:description", content: "Online reading with sepia mode, bookmarks and adjustable type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] : [],
  }),
  component: Reader,
});

type Mode = "light" | "sepia" | "dark";
const modeCls: Record<Mode, string> = {
  light: "bg-card text-card-foreground",
  sepia: "bg-sepia text-sepia-foreground",
  dark: "dark bg-background text-foreground",
};

function Reader() {
  const { book } = Route.useLoaderData();
  const [ch, setCh] = useState(0);
  const [size, setSize] = useState(20);
  const [mode, setMode] = useState<Mode>("sepia");
  const [toc, setToc] = useState(false);
  const [marks, setMarks] = useState<number[]>([]);
  const chapter = readerChapters[ch];
  const progress = ((ch + 1) / readerChapters.length) * 100;
  const marked = marks.includes(ch);

  return (
    <div className={cn("min-h-screen transition-colors", modeCls[mode])}>
      <header className="sticky top-0 z-10 border-b border-current/10 bg-inherit">
        <div className="mx-auto grid h-14 max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4">
          <div className="flex items-center gap-1">
            <Link to="/library/ebooks" aria-label="Exit reader" className="grid h-9 w-9 place-items-center rounded-full hover:bg-current/10"><X className="h-4 w-4" /></Link>
            <button onClick={() => setToc(true)} aria-label="Table of contents" className="grid h-9 w-9 place-items-center rounded-full hover:bg-current/10"><List className="h-4 w-4" /></button>
          </div>
          <div className="min-w-0 text-center"><div className="truncate font-display text-base">{book.titleEn}</div><div className="truncate text-xs opacity-60">{book.authorEn}</div></div>
          <div className="flex items-center gap-1">
            <button onClick={() => setSize((s) => Math.max(15, s - 1))} aria-label="Smaller text" className="grid h-9 w-9 place-items-center rounded-full hover:bg-current/10"><Minus className="h-4 w-4" /></button>
            <span className="hidden w-6 text-center text-xs tabular-nums sm:block">{size}</span>
            <button onClick={() => setSize((s) => Math.min(28, s + 1))} aria-label="Larger text" className="grid h-9 w-9 place-items-center rounded-full hover:bg-current/10"><Plus className="h-4 w-4" /></button>
            <div className="ml-1 hidden gap-1 sm:flex" role="group" aria-label="Reading theme">
              {(["light", "sepia", "dark"] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)} aria-label={`${m} mode`} aria-pressed={mode === m}
                  className={cn("h-7 w-7 rounded-full border-2", m === "light" ? "bg-card" : m === "sepia" ? "bg-sepia" : "bg-[var(--cover-5)]", mode === m ? "border-accent" : "border-current/20")} />
              ))}
            </div>
            <button onClick={() => { setMarks((x) => marked ? x.filter((i) => i !== ch) : [...x, ch]); toast(marked ? "Bookmark removed" : "Page bookmarked"); }} aria-label="Bookmark" aria-pressed={marked} className="grid h-9 w-9 place-items-center rounded-full hover:bg-current/10">
              <Bookmark className={cn("h-4 w-4", marked && "fill-accent text-accent")} />
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-current/10"><div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <article className="mx-auto max-w-[38rem] px-6 pb-32 pt-16">
        <div className="mb-2 text-center text-xs uppercase tracking-[0.2em] opacity-60">Chapter {ch + 1} of {readerChapters.length}</div>
        <h1 className="mb-12 text-center text-3xl md:text-4xl">{chapter.title.split("—")[1]?.trim()}</h1>
        <div className="font-display" style={{ fontSize: size, lineHeight: 1.75 }}>
          {chapter.paras.map((p, i) => <p key={i} className={cn("mb-[1.1em]", i > 0 && "indent-8")}>{p}</p>)}
        </div>
        <p className="mt-10 text-center text-xs opacity-50">Demo excerpt — an English adaptation prepared for this prototype.</p>
      </article>

      <footer className="fixed inset-x-0 bottom-0 border-t border-current/10 bg-inherit">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <button disabled={ch === 0} onClick={() => { setCh(ch - 1); window.scrollTo(0, 0); }} className="inline-flex items-center gap-1 text-sm disabled:opacity-30"><ChevronLeft className="h-4 w-4" /> Previous</button>
          <div className="flex items-center gap-3 text-xs tabular-nums opacity-70"><span>{Math.round(progress)}% read</span><span className="hidden sm:inline">· ~{(readerChapters.length - ch - 1) * 6} min left in excerpt</span></div>
          <button disabled={ch === readerChapters.length - 1} onClick={() => { setCh(ch + 1); window.scrollTo(0, 0); }} className="inline-flex items-center gap-1 text-sm disabled:opacity-30">Next <ChevronRight className="h-4 w-4" /></button>
        </div>
      </footer>

      <Sheet open={toc} onOpenChange={setToc}>
        <SheetContent side="left" className="bg-background p-6">
          <SheetTitle className="font-display text-2xl font-normal">Contents</SheetTitle>
          <ol className="mt-6 divide-y divide-border">
            {readerChapters.map((c, i) => (
              <li key={i}><button onClick={() => { setCh(i); setToc(false); }} className={cn("flex w-full items-center justify-between py-3 text-left", i === ch && "text-accent")}>
                <span className="font-display text-lg">{c.title}</span>{marks.includes(i) && <Bookmark className="h-3.5 w-3.5 fill-current" />}</button></li>
            ))}
          </ol>
          <div className="mt-8 sm:hidden">
            <div className="eyebrow mb-3">Reading theme</div>
            <div className="flex gap-2">{(["light", "sepia", "dark"] as Mode[]).map((m) => <button key={m} onClick={() => setMode(m)} className={cn("h-9 rounded-full border px-4 text-sm capitalize", mode === m && "border-foreground")}>{m}</button>)}</div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

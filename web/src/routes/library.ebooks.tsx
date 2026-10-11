import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCover, bookAuthor, bookTitle, Empty, PageIntro, WishButton } from "@/components/noholi";
import { books, type Book } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library/ebooks")({
  head: () => ({
    meta: [
      { title: "E-Books — Read online at Noholi" },
      { name: "description", content: "Read Bangla and English e-books in your browser with Noholi's reader." },
      { property: "og:title", content: "Noholi E-Books" },
      { property: "og:description", content: "A digital reading library with sepia mode, bookmarks and adjustable type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ebooks,
});

function EbookRow({ b }: { b: Book }) {
  const { lang } = useApp();
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-5 border-b border-border py-6">
      <Link to="/book/$id" params={{ id: b.id }}><BookCover book={b} size="sm" /></Link>
      <div className="flex min-w-0 flex-col">
        <div className="eyebrow">{b.language} · {b.genre}</div>
        <Link to="/book/$id" params={{ id: b.id }} className="mt-1 font-display text-xl leading-tight hover:text-accent">{bookTitle(b, lang)}</Link>
        <div className="truncate text-sm text-muted-foreground">{bookAuthor(b, lang)}</div>
        <div className="mt-auto flex items-center gap-4 pt-3">
          <Button size="sm" asChild><Link to="/read/$id" params={{ id: b.id }}><BookOpen /> Read</Link></Button>
          <span className="text-xs text-success">● Unlimited access</span>
          <WishButton id={b.id} className="ml-auto text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function Ebooks() {
  const { t } = useApp();
  const all = books.filter((b) => b.ebook);
  const [q, setQ] = useState("");
  const [langF, setLangF] = useState<string>("All");
  const [genre, setGenre] = useState<string>("All");
  const res = useMemo(() => all.filter((b) =>
    (!q || [b.titleEn, b.titleBn, b.authorEn].some((x) => x.toLowerCase().includes(q.toLowerCase()))) &&
    (langF === "All" || b.language === langF) && (genre === "All" || b.genre === genre)), [q, langF, genre]);
  const filtering = q || langF !== "All" || genre !== "All";
  const Pill = ({ v, cur, set }: { v: string; cur: string; set: (v: string) => void }) => (
    <button onClick={() => set(v)} aria-pressed={cur === v} className={cn("h-8 rounded-full border px-3 text-sm", cur === v ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50")}>{v}</button>
  );

  return (
    <>
      <PageIntro eyebrow={`${t("library")} / ${t("ebooks")}`} title="Read anywhere.">Every e-book opens in the browser — no app, no download. Your place is saved across devices.</PageIntro>
      <section className="container-page">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e-books" className="h-12 rounded-none border-foreground/30 pl-11" aria-label="Search e-books" /></div>
          <div className="flex flex-wrap gap-2">{["All", "Bangla", "English"].map((v) => <Pill key={v} v={v} cur={langF} set={setLangF} />)}<span className="mx-2 w-px bg-border" />{["All", "Fiction", "Non-fiction"].map((v) => <Pill key={v} v={v} cur={genre} set={setGenre} />)}</div>
        </div>

        {filtering ? (
          <div className="mt-10">
            <div className="mb-4 text-sm text-muted-foreground">{res.length} results</div>
            {res.length ? <div className="grid gap-x-10 md:grid-cols-2">{res.map((b) => <EbookRow key={b.id} b={b} />)}</div>
              : <Empty title="No e-books found" body="Try another title, or browse the full collection." />}
          </div>
        ) : (
          <>
            <div className="mt-14 grid gap-10 lg:grid-cols-3">
              {all.slice(0, 3).map((b, i) => (
                <Link key={b.id} to="/read/$id" params={{ id: b.id }} className={cn("group flex items-end gap-6 p-8", i === 0 ? "bg-foreground text-background lg:col-span-2" : "bg-secondary")}>
                  <BookCover book={b} className={i === 0 ? "w-40 shrink-0" : "w-24 shrink-0"} size={i === 0 ? "md" : "sm"} />
                  <div className="min-w-0">
                    <div className={cn("eyebrow mb-2", i === 0 && "!text-background/60")}>{i === 0 ? "Featured e-book" : "Popular"}</div>
                    <div className={cn("font-bangla leading-tight", i === 0 ? "text-4xl" : "text-2xl")}>{b.titleBn}</div>
                    <div className={cn("mt-1 text-sm", i === 0 ? "text-background/70" : "text-muted-foreground")}>{b.authorEn}</div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4">Start reading</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-20 grid gap-16 lg:grid-cols-2">
              <div><h2 className="rule-top pt-5 text-3xl">Recently added</h2>{all.slice(-5).reverse().map((b) => <EbookRow key={b.id} b={b} />)}</div>
              <div><h2 className="rule-top pt-5 text-3xl">Popular this month</h2>{all.slice(3, 8).map((b) => <EbookRow key={b.id} b={b} />)}</div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

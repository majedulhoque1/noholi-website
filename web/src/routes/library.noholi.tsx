import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BookCover, PageIntro, WishButton } from "@/components/noholi";
import { Button } from "@/components/ui/button";
import { books } from "@/lib/data";

export const Route = createFileRoute("/library/noholi")({
  head: () => ({
    meta: [
      { title: "Noholi Books — Publications from Noholi Prokash" },
      { name: "description", content: "Novels, poetry, anthologies and picture books published by Noholi Prokash." },
      { property: "og:title", content: "Noholi Books" },
      { property: "og:description", content: "New Bangla and English writing from Noholi's own press." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NoholiBooks,
});

function NoholiBooks() {
  const list = books.filter((b) => b.noholi);
  const [lead, ...rest] = list;
  return (
    <>
      <PageIntro eyebrow="Library / Noholi Books" title={<>Noholi <em className="text-accent">Prokash.</em></>}>
        Our small press publishes a handful of books each year — debut novelists, poets of the city and anthologies written by the library's own readers.
      </PageIntro>

      <section className="container-page">
        <div className="grid gap-12 bg-secondary p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:p-16">
          <BookCover book={lead} size="lg" className="mx-auto w-full max-w-[300px]" />
          <div className="flex flex-col justify-center">
            <div className="eyebrow mb-4">Lead title · {lead.year}</div>
            <h2 className="font-bangla text-5xl leading-tight">{lead.titleBn}</h2>
            <div className="mt-2 font-display text-2xl italic text-muted-foreground">{lead.titleEn}</div>
            <p className="mt-6 max-w-lg text-lg leading-relaxed">{lead.description}</p>
            <div className="mt-4 text-sm text-muted-foreground">{lead.authorEn} · {lead.pages} pages · {lead.edition} edition · ISBN {lead.isbn}</div>
            <div className="mt-8 flex flex-wrap items-center gap-4"><Button size="lg" asChild><Link to="/book/$id" params={{ id: lead.id }}>View details <ArrowRight /></Link></Button><WishButton id={lead.id} label /></div>
          </div>
        </div>
      </section>

      <section className="container-page mt-24">
        <h2 className="mb-4 rule-top pt-5 text-3xl md:text-4xl">The 2024–25 list</h2>
        <ol className="divide-y divide-border">
          {rest.map((b, i) => (
            <li key={b.id} className="grid gap-6 py-10 md:grid-cols-[40px_160px_minmax(0,1fr)_auto] md:items-start">
              <span className="font-display text-muted-foreground">0{i + 2}</span>
              <Link to="/book/$id" params={{ id: b.id }}><BookCover book={b} className="w-32 md:w-full" /></Link>
              <div className="max-w-xl">
                <div className="eyebrow mb-2">{b.genre} · {b.category} · {b.language}</div>
                <Link to="/book/$id" params={{ id: b.id }} className="hover:text-accent"><h3 className={b.language === "Bangla" ? "font-bangla text-3xl" : "text-3xl"}>{b.language === "Bangla" ? b.titleBn : b.titleEn}</h3></Link>
                {b.language === "Bangla" && <div className="font-display italic text-muted-foreground">{b.titleEn}</div>}
                <p className="mt-4 leading-relaxed text-muted-foreground">{b.description}</p>
                <div className="mt-3 text-sm">{b.authorEn} · {b.year} · {b.pages} pages</div>
              </div>
              <div className="flex items-center gap-4"><WishButton id={b.id} /><Button variant="outline" asChild><Link to="/book/$id" params={{ id: b.id }}>Details</Link></Button></div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

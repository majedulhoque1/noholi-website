import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PageIntro } from "@/components/noholi";
import { gallery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Life at Noholi Library" },
      {
        name: "description",
        content: "Photographs of Noholi's reading rooms, books, readers and literary evenings.",
      },
      { property: "og:title", content: "Noholi Gallery" },
      { property: "og:description", content: "Rooms, books, readers and evenings at Noholi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Gallery,
});

const cats = [
  "All",
  "Library",
  "Books",
  "Reading",
  "Community",
  "Architecture",
  "Literary activities",
];

function Gallery() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = gallery.filter((g) => cat === "All" || g.cat === cat);
  const cur = open !== null ? list[open] : null;
  return (
    <>
      <PageIntro eyebrow="Library / Gallery" title="Inside Noholi.">
        Rooms, shelves, readers and evenings — photographed by members and staff.
      </PageIntro>
      <section className="container-page">
        <div className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-border">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm",
                cat === c
                  ? "border-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {list.map((g, i) => (
            <figure key={i} className="mb-6 break-inside-avoid">
              <button
                onClick={() => setOpen(i)}
                className="block w-full overflow-hidden"
                aria-label={`Open ${g.caption}`}
              >
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  className={cn(
                    "photo w-full object-cover transition-transform duration-500 hover:scale-[1.02]",
                    g.h > 1000 ? "aspect-[4/5]" : "aspect-[4/3]",
                  )}
                />
              </button>
              <figcaption className="mt-2 flex justify-between text-sm">
                <span>{g.caption}</span>
                <span className="text-muted-foreground">{g.cat}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl border-0 bg-background p-0 sm:rounded-none [&>button]:hidden">
          {cur && (
            <>
              <DialogTitle className="sr-only">{cur.caption}</DialogTitle>
              <img src={cur.src} alt={cur.caption} className="max-h-[78vh] w-full object-contain" />
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-display text-xl">{cur.caption}</div>
                  <div className="text-xs text-muted-foreground">
                    {cur.cat} · {open! + 1} / {list.length}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen((o) => (o! - 1 + list.length) % list.length)}
                    aria-label="Previous"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setOpen((o) => (o! + 1) % list.length)}
                    aria-label="Next"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setOpen(null)}
                    aria-label="Close"
                    className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

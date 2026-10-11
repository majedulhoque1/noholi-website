import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BackLink, Fields, NotFoundRecord, RecordHeader, Section, Timeline } from "@/components/record-view";
import { getBook } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/recommendations_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Recommendation — My Noholi` },
      { name: "description", content: "What you recommended to Noholi, why, and where it stands." },
      { property: "og:title", content: `${params.id} — Recommendation` },
      { property: "og:description", content: "What you recommended to Noholi, why, and where it stands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecDetail,
});

function RecDetail() {
  const { id } = Route.useParams();
  const { recommendations } = useApp();
  const r = recommendations.find((x) => x.id === id);
  const back = <BackLink to="/account/recommendations" label="Back to My Recommendations" />;
  if (!r) return <NotFoundRecord what="Recommendation" back={back} />;
  const catalogued = r.catalogId ? getBook(r.catalogId) : undefined;
  return (
    <article className="max-w-5xl">
      <RecordHeader back={back} eyebrow={r.format ?? "Physical Book"} title={r.title} ids={[{ label: "Recommendation", value: r.id }]} status={r.status}
        statusNote={r.explanation} dates={[{ label: "Submitted", value: r.date }, { label: "Last updated", value: r.updated }]} />
      <Section n="A" title="Recommendation">
        <Fields rows={[["Title", r.title], ["Author", r.author], ["Language", r.language], ["Format", r.format ?? "Physical Book"]]} />
      </Section>
      {[r.publisher, r.isbn, r.year, r.edition, r.genre, r.category, r.narrator, r.source].some(Boolean) && (
        <Section n="B" title="More details">
          <Fields rows={[["Publisher", r.publisher], ["ISBN", r.isbn], ["Year", r.year], ["Edition", r.edition], ["Genre", r.genre], ["Category", r.category], ["Narrator", r.narrator], ["Source / platform", r.source]]} />
        </Section>
      )}
      <Section n="C" title="Your reason">
        <p className="max-w-2xl font-serif text-lg leading-relaxed">“{r.reason}”</p>
        {r.notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {r.notes}</p>}
      </Section>
      <Section n="D" title="Status">
        {r.timeline?.length ? <Timeline events={r.timeline} /> : <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>}
        {r.status === "Acquired" && (catalogued
          ? <Button variant="outline" className="mt-6" asChild><Link to="/book/$id" params={{ id: catalogued.id }}>View in catalogue</Link></Button>
          : <p className="mt-6 text-sm text-muted-foreground">A link to the catalogue record will appear here once the book has been catalogued.</p>)}
        <p className="mt-6 text-xs text-muted-foreground">Recommendations help guide purchases, but acquisition isn't guaranteed.</p>
      </Section>
    </article>
  );
}

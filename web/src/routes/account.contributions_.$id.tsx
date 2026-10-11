import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/noholi";
import { kindLabel } from "@/components/contribution-list";
import {
  BackLink,
  Fields,
  NotFoundRecord,
  RecordHeader,
  Section,
  Timeline,
} from "@/components/record-view";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/contributions_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Submission — My Noholi` },
      {
        name: "description",
        content: "Content, status and editor feedback for one of your Noholi submissions.",
      },
      { property: "og:title", content: `${params.id} — Submission` },
      {
        property: "og:description",
        content: "Content, status and editor feedback for one of your Noholi submissions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContributionDetail,
});

const statusNote: Record<string, string> = {
  Draft: "Only you can see this draft. It hasn't been sent to the editors.",
  "Pending Review": "Waiting for an editor. You can't edit it while it's in review.",
  "Needs Revision": "The editors asked for changes — see their feedback below.",
  Published:
    "Live on the website. Published work can't be edited here; contact the library to request a correction.",
  Approved: "Approved and scheduled for publishing.",
  Rejected: "This submission won't be published.",
};

function ContributionDetail() {
  const { id } = Route.useParams();
  const { contributions, removeContribution } = useApp();
  const c = contributions.find((x) => x.id === id);
  const back = (
    <BackLink
      to={c?.kind === "review" ? "/account/reviews" : "/account/contributions"}
      label="Back"
    />
  );
  if (!c) return <NotFoundRecord what="Submission" back={back} />;
  const edit = { type: c.kind, ...(c.bookId ? { book: c.bookId } : {}) };

  return (
    <article className="max-w-5xl">
      <RecordHeader
        back={back}
        eyebrow={kindLabel[c.kind]}
        title={<span className="break-words">{c.title}</span>}
        ids={[{ label: "Submission", value: c.id }]}
        status={c.status}
        statusNote={statusNote[c.status]}
        dates={[
          { label: "Submitted", value: c.submitted },
          { label: "Last updated", value: c.updated },
        ]}
      />

      {c.note && (c.status === "Needs Revision" || c.status === "Rejected") && (
        <div className="mt-8 border-l-2 border-accent bg-accent/5 p-5">
          <div className="eyebrow">
            {c.status === "Rejected" ? "Explanation from the editors" : "Editor feedback"}
          </div>
          <p className="mt-2">{c.note}</p>
        </div>
      )}

      <Section n="A" title="Details">
        <Fields
          rows={[
            ["Type", kindLabel[c.kind]],
            [
              "Book",
              c.bookTitle &&
                (c.bookId ? (
                  <Link
                    to={c.bookId.startsWith("a-") ? "/audio/$id" : "/book/$id"}
                    params={{ id: c.bookId }}
                    className="underline underline-offset-4 hover:text-accent"
                  >
                    {c.bookTitle}
                  </Link>
                ) : (
                  c.bookTitle
                )),
            ],
            ["Book source", c.bookSource],
            ["Rating", c.rating ? <Stars n={c.rating} /> : undefined],
            ["Category", c.category],
            ["Language", c.language],
            ["Tags", c.tags?.join(", ")],
          ]}
        />
      </Section>

      <Section n="B" title="Submitted content">
        {c.excerpt && (
          <p className="mb-4 font-serif text-lg italic text-muted-foreground">{c.excerpt}</p>
        )}
        {c.content && (
          <p className="max-w-2xl whitespace-pre-line break-words font-serif text-lg leading-relaxed">
            {c.content}
          </p>
        )}
        {c.file && (
          <div className="mt-4 flex flex-wrap items-center gap-4 border border-border p-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="break-all text-sm font-medium">{c.file.name}</div>
              <div className="text-xs text-muted-foreground">
                {c.file.type} · {c.file.size} · private — visible to you and the editors only
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast("Secure preview isn't available in this demo", {
                  description: "Files are never shared through a public link.",
                })
              }
            >
              Preview
            </Button>
          </div>
        )}
        {!c.content && !c.file && !c.excerpt && (
          <p className="text-sm text-muted-foreground">No content saved yet.</p>
        )}
      </Section>

      <Section n="C" title="Status">
        {c.timeline?.length ? (
          <Timeline events={c.timeline} />
        ) : (
          <p className="text-sm text-muted-foreground">No events recorded.</p>
        )}
      </Section>

      <div className="flex flex-wrap gap-2 py-8">
        {c.status === "Draft" && (
          <>
            <Button variant="accent" asChild>
              <Link to="/account/contribute" search={edit}>
                Continue Editing
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => removeContribution(c.id)} // coming soon: shows a notice, deletes nothing
            >
              Delete Draft
            </Button>
          </>
        )}
        {c.status === "Needs Revision" && (
          <Button variant="accent" asChild>
            <Link to="/account/contribute" search={edit}>
              {c.kind === "review" ? "Revise Review" : "Revise Submission"}
            </Link>
          </Button>
        )}
        {c.status === "Published" &&
          (c.slug ? (
            <Button variant="outline" asChild>
              <Link to="/article/$slug" params={{ slug: c.slug }}>
                View Published Content
              </Link>
            </Button>
          ) : (
            c.bookId && (
              <Button variant="outline" asChild>
                <Link to="/book/$id" params={{ id: c.bookId }}>
                  View Published Review
                </Link>
              </Button>
            )
          ))}
        <Button variant="outline" asChild>
          <Link to="/contact">Contact Library</Link>
        </Button>
      </div>
    </article>
  );
}

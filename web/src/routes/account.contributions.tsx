import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  ComingSoonBanner,
  ContributionRows,
  FilterPills,
  matchStatus,
  statusFilters,
} from "@/components/contribution-list";
import type { Contribution } from "@/lib/data";
import { useApp } from "@/lib/store";

const types = ["All", "Blogs", "Creative Writings", "Book Reviews"] as const;

export const Route = createFileRoute("/account/contributions")({
  validateSearch: z.object({ f: z.string().optional(), s: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "My contributions — My Noholi" },
      {
        name: "description",
        content: "Your blogs, creative writing and book reviews submitted to Noholi.",
      },
      { property: "og:title", content: "My contributions — My Noholi" },
      {
        property: "og:description",
        content: "Your blogs, creative writing and book reviews submitted to Noholi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contributions,
});

const matchType = (t: string, c: Contribution) =>
  t === "All" ||
  (t === "Blogs"
    ? c.kind === "blog"
    : t === "Creative Writings"
      ? c.kind === "creative"
      : c.kind === "review");

function Contributions() {
  const { contributions } = useApp();
  const search = Route.useSearch();
  const f = (types as readonly string[]).includes(search.f ?? "") ? search.f! : "All";
  const s = (statusFilters as readonly string[]).includes(search.s ?? "") ? search.s! : "All";
  const q = (nf: string, ns: string) => ({
    to: "/account/contributions",
    search: { ...(nf !== "All" ? { f: nf } : {}), ...(ns !== "All" ? { s: ns } : {}) },
  });
  const byType = contributions.filter((c) => matchType(f, c));
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h1 className="text-4xl">My contributions</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Everything you send is read by Noholi's editors before it appears on the website.
            Nothing is published automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/account/contribute" search={{ type: "blog" }}>
              Submit a Blog
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/account/contribute" search={{ type: "creative" }}>
              Submit Creative Writing
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/account/contribute" search={{ type: "review" }}>
              Write a Book Review
            </Link>
          </Button>
        </div>
      </div>
      <ComingSoonBanner className="mt-6" />
      <div className="mt-10 space-y-3 border-b border-border pb-5">
        <FilterPills
          label="Type"
          active={f}
          href={(k) => q(k, s)}
          items={types.map((t) => ({
            key: t,
            text: t === "Creative Writings" ? "Creative Writing" : t,
            count: contributions.filter((c) => matchType(t, c)).length,
          }))}
        />
        <FilterPills
          label="Status"
          active={s}
          href={(k) => q(f, k)}
          items={statusFilters.map((x) => ({
            key: x,
            text: x === "Draft" ? "Drafts" : x,
            count: byType.filter((c) => matchStatus(x, c)).length,
          }))}
        />
      </div>
      <ContributionRows
        list={byType.filter((c) => matchStatus(s, c))}
        emptyBody={
          s === "Draft"
            ? "Drafts you save will wait here until you're ready."
            : "Try another type or status."
        }
      />
    </>
  );
}

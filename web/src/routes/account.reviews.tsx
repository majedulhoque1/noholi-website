import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ContributionRows, FilterPills, matchStatus, statusFilters } from "@/components/contribution-list";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/reviews")({
  validateSearch: z.object({ s: z.string().optional() }),
  head: () => ({ meta: [{ title: "My Book Reviews — My Noholi" }, { name: "description", content: "Your book, e-book and audio book reviews and where each one stands in moderation." },
      { property: "og:title", content: "My Book Reviews — My Noholi" },
      { property: "og:description", content: "Your Noholi book reviews and their moderation status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] }),
  component: Reviews,
});

function Reviews() {
  const { contributions } = useApp();
  const search = Route.useSearch();
  const s = (statusFilters as readonly string[]).includes(search.s ?? "") ? search.s! : "All";
  const reviews = contributions.filter((c) => c.kind === "review");
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div><h1 className="text-4xl">My Book Reviews</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Reviews are checked by editors before they appear on a book's page. Pending reviews are visible only to you.</p></div>
        <Button size="sm" variant="outline" asChild><Link to="/account/contribute" search={{ type: "review" }}>Write a Book Review</Link></Button>
      </div>
      <div className="mt-10 border-b border-border pb-5">
        <FilterPills label="Status" active={s} href={(k) => ({ to: "/account/reviews", search: (k === "All" ? {} : { s: k }) as Record<string, string> })}
          items={statusFilters.map((x) => ({ key: x, text: x === "All" ? "All Reviews" : x === "Draft" ? "Drafts" : x, count: reviews.filter((c) => matchStatus(x, c)).length }))} />
      </div>
      <ContributionRows list={reviews.filter((c) => matchStatus(s, c))} showKind={false} emptyBody="No reviews with this status." />
    </>
  );
}

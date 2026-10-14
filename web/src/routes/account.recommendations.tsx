import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Empty, fmtDate, StatusBadge } from "@/components/noholi";
import { DetailsLink } from "@/components/record-view";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/recommendations")({
  head: () => ({
    meta: [
      { title: "My Recommendations — My Noholi" },
      {
        name: "description",
        content:
          "Books, e-books and audio books you've suggested to Noholi, with their review status.",
      },
      { property: "og:title", content: "My Recommendations — My Noholi" },
      {
        property: "og:description",
        content: "Books you've suggested to Noholi, with their review status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const { recommendations, collections, t } = useApp();
  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h1 className="text-4xl">My Recommendations</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Titles you've asked Noholi to add. Every suggestion is read, but not every one can be
            acquired. Your private reading list lives in{" "}
            <Link to="/account/wishlist" className="underline underline-offset-2">
              Wishlist
            </Link>
            .
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link to="/account/recommend">Recommend a Book</Link>
        </Button>
      </div>
      {recommendations.length === 0 ? (
        <Empty
          title={collections.loading ? t("auth.loadingAccount") : "No recommendations yet"}
          body="Books you suggest to the library will appear here with their status."
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          <li className="hidden grid-cols-[100px_minmax(0,1fr)_130px_120px_120px_100px] gap-5 py-3 text-xs text-muted-foreground md:grid">
            <span>ID</span>
            <span>Title</span>
            <span>Format</span>
            <span>Submitted</span>
            <span>Status</span>
            <span />
          </li>
          {recommendations.map((r) => (
            <li
              key={r.id}
              className="grid gap-1.5 py-4 md:grid-cols-[100px_minmax(0,1fr)_130px_120px_120px_100px] md:items-center md:gap-5"
            >
              <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
              <div className="min-w-0">
                <div className="font-display text-lg leading-tight">{r.title}</div>
                <div className="truncate text-sm text-muted-foreground">{r.author}</div>
              </div>
              <span className="text-sm">{r.format ?? "Physical Book"}</span>
              <span className="text-sm">
                <span className="text-muted-foreground md:hidden">Submitted </span>
                {fmtDate(r.date)}
              </span>
              <StatusBadge status={r.status} />
              <div className="md:text-right">
                <DetailsLink to="/account/recommendations/$id" params={{ id: r.id }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

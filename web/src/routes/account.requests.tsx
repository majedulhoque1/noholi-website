import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/noholi";
import {
  BookThumb,
  DetailsLink,
  ErrorState,
  ListSkeleton,
  ToneBadge,
} from "@/components/record-view";
import {
  bookAuthorOf,
  bookTitleOf,
  myRequests,
  requestStatusView,
  useFmt,
  useLoad,
} from "@/lib/lending";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/requests")({
  head: () => ({
    meta: [
      { title: "Borrow requests — My Noholi" },
      { name: "description", content: "Track your Noholi borrow requests." },
      { property: "og:title", content: "Borrow requests — My Noholi" },
      { property: "og:description", content: "Track your Noholi borrow requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Requests,
});

const filters = ["open", "all", "past"] as const;

function Requests() {
  const { t, lang } = useApp();
  const { ready } = useAuth();
  const fmt = useFmt();
  const [f, setF] = useState<(typeof filters)[number]>("open");
  const { data, error, loading, reload } = useLoad(myRequests, [], ready);

  const list = (data ?? []).filter(
    (r) => f === "all" || (f === "open" ? r.status === "Pending" : r.status !== "Pending"),
  );

  return (
    <>
      <div className="mb-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h1 className="text-4xl">{t("lending.req.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("lending.req.intro")}</p>
        </div>
        <div className="flex gap-2">
          {filters.map((x) => (
            <button
              key={x}
              onClick={() => setF(x)}
              aria-pressed={f === x}
              className={cn(
                "h-8 rounded-full border px-4 text-sm",
                f === x ? "border-foreground bg-foreground text-background" : "border-border",
              )}
            >
              {t(
                x === "open"
                  ? "lending.req.filterOpen"
                  : x === "all"
                    ? "lending.req.filterAll"
                    : "lending.req.filterPast",
              )}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState
          title={t("lending.loadError")}
          message={error}
          retryLabel={t("lending.retry")}
          onRetry={reload}
        />
      ) : list.length === 0 ? (
        <Empty
          title={t("lending.req.emptyTitle")}
          body={t("lending.req.emptyBody")}
          action={
            <Button asChild>
              <Link to="/library/books">{t("lending.browseBooks")}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          <li className="hidden grid-cols-[56px_minmax(0,1fr)_120px_120px_190px_100px] gap-5 py-3 text-xs text-muted-foreground md:grid">
            <span />
            <span>{t("lending.req.colBook")}</span>
            <span>{t("lending.req.colSubmitted")}</span>
            <span>{t("lending.req.colPickup")}</span>
            <span>{t("lending.req.colStatus")}</span>
            <span />
          </li>
          {list.map((r) => {
            const sv = requestStatusView(r.status);
            const title = bookTitleOf(r.book, lang, r.book_title);
            return (
              <li
                key={r.id}
                className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-5 gap-y-1.5 py-5 md:grid-cols-[56px_minmax(0,1fr)_120px_120px_190px_100px] md:items-center"
              >
                <BookThumb book={r.book} fallbackTitle={r.book_title} size="sm" />
                <div className="min-w-0">
                  <div className="break-words font-display text-xl leading-snug">{title}</div>
                  <div className="break-words text-sm text-muted-foreground">
                    {bookAuthorOf(r.book, lang)}
                  </div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{r.id}</div>
                </div>
                <span className="col-start-2 text-sm md:col-start-auto">
                  <span className="text-muted-foreground md:hidden">
                    {t("lending.req.submitted")}
                  </span>
                  {fmt.date(r.created_at)}
                </span>
                <span className="col-start-2 text-sm md:col-start-auto">
                  <span className="text-muted-foreground md:hidden">{t("lending.req.pickup")}</span>
                  {fmt.date(r.pickup_date)}
                </span>
                <div className="col-start-2 min-w-0 md:col-start-auto">
                  <ToneBadge label={t(sv.key)} tone={sv.tone} />
                  <div className="mt-1 break-words text-xs text-muted-foreground">
                    {r.status === "Pending"
                      ? t("lending.req.collectBy", { date: fmt.date(r.expires_at) })
                      : r.status === "Issued" && r.loan_id
                        ? t("lending.req.loanRef", { id: r.loan_id })
                        : r.reason
                          ? t("lending.req.reasonLine", { reason: r.reason })
                          : ""}
                  </div>
                </div>
                <div className="col-start-2 md:col-start-auto md:text-right">
                  <DetailsLink to="/account/requests/$id" params={{ id: r.id }}>
                    {t("lending.viewDetails")}
                  </DetailsLink>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookThumb, DetailsLink, ErrorState, ToneBadge } from "@/components/record-view";
import { useAuth } from "@/lib/auth";
import { daysBetween, formatDhaka, hourDhaka, todayDhaka } from "@/lib/dhaka-date";
import {
  bookTitleOf,
  myLoans,
  myRequests,
  requestStatusView,
  useFmt,
  useLoad,
} from "@/lib/lending";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "My library overview — My Noholi" },
      {
        name: "description",
        content: "Your Noholi membership, loans and borrow requests at a glance.",
      },
      { property: "og:title", content: "My library overview — My Noholi" },
      {
        property: "og:description",
        content: "Your Noholi membership, loans and borrow requests at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Block({
  title,
  link,
  children,
}: {
  title: string;
  link?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 border-t border-foreground pt-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl">{title}</h2>
        {link}
      </div>
      {children}
    </section>
  );
}

function Stat({ to, n, label, note }: { to: string; n: ReactNode; label: string; note?: string }) {
  return (
    <Link
      to={to}
      className="group block border-b border-border py-4 last:border-b-0 sm:px-5 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"
    >
      <div className="text-xs text-muted-foreground group-hover:text-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl tabular-nums group-hover:text-accent">{n}</div>
      {note && <div className="text-xs text-muted-foreground">{note}</div>}
    </Link>
  );
}

const More = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="text-sm underline underline-offset-4 hover:text-accent">
    {children}
  </Link>
);

function Dashboard() {
  const { t, lang, wishlist, recommendations, contributions } = useApp();
  const { ready, member, memberError } = useAuth();
  const fmt = useFmt();
  const { data, error, loading, reload } = useLoad(
    async () => {
      const [loans, requests] = await Promise.all([myLoans(), myRequests()]);
      return { loans, requests };
    },
    [],
    ready && !!member,
  );

  if (ready && !member && memberError)
    return (
      <ErrorState
        title={t("lending.loadError")}
        message={memberError}
        retryLabel={t("lending.retry")}
        onRetry={() => window.location.reload()}
      />
    );
  if (!member)
    return (
      <div className="space-y-8" role="status" aria-busy="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );

  const today = todayDhaka();
  const hour = hourDhaka();
  const greetKey =
    hour < 12
      ? "lending.dash.morning"
      : hour < 17
        ? "lending.dash.afternoon"
        : "lending.dash.evening";
  const firstName = member.name.trim().split(/\s+/)[0] ?? member.name;
  const since = typeof member["created_at"] === "string" ? member["created_at"] : null;

  const current = (data?.loans ?? [])
    .filter((l) => l.derived_status === "Active" || l.derived_status === "Overdue")
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const pending = (data?.requests ?? []).filter((r) => r.status === "Pending");
  const recentReq = (data?.requests ?? []).slice(0, 4);
  const owed = Number(member.outstanding_fines || 0) + Number(member.accruing_fines || 0);

  const actions: {
    key: string;
    text: ReactNode;
    to: string;
    params?: Record<string, string>;
    label: string;
  }[] = [
    ...current
      .filter((l) => l.derived_status === "Overdue")
      .map((l) => ({
        key: l.id,
        text: (
          <>
            {t("lending.dash.actOverdue", {
              title: bookTitleOf(l.book, lang, l.book_title),
              n: l.days_overdue,
            })}
          </>
        ),
        to: "/account/requests/$id",
        params: { id: l.request_id ?? l.id },
        label: t("lending.dash.viewLoan"),
      })),
    ...pending.map((r) => ({
      key: r.id,
      text: (
        <>
          {t("lending.dash.actCollect", {
            title: bookTitleOf(r.book, lang, r.book_title),
            date: fmt.date(r.expires_at),
          })}
        </>
      ),
      to: "/account/requests/$id",
      params: { id: r.id },
      label: t("lending.dash.viewRequest"),
    })),
    ...(owed > 0
      ? [
          {
            key: "fines",
            text: <>{t("lending.dash.actFines", { amount: fmt.taka(owed) })}</>,
            to: "/account/fines",
            label: t("lending.dash.viewFines"),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-12">
      <section>
        <div className="eyebrow mb-3">
          {formatDhaka(today, {
            locale: fmt.locale,
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
        <h1 className="break-words text-5xl leading-tight md:text-6xl">
          {t(greetKey, { name: firstName })}
        </h1>
        {since && (
          <p className="mt-3 text-muted-foreground">
            {t("lending.dash.memberSince", { date: fmt.date(since) })}
          </p>
        )}
      </section>

      <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          to="/account/borrowed"
          n={member.active_loans}
          label={t("lending.dash.statBorrowed")}
        />
        <Stat to="/account/requests" n={member.active_holds} label={t("lending.dash.statHolds")} />
        <Stat
          to="/account/borrowed"
          n={member.overdue_loans}
          label={t("lending.dash.statOverdue")}
        />
        <Stat to="/account/fines" n={fmt.taka(owed)} label={t("lending.dash.statFines")} />
      </div>

      <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
        <Stat to="/account/wishlist" n={wishlist.length} label={t("auth.nav.wishlist")} />
        <Stat
          to="/account/recommendations"
          n={recommendations.length}
          label={t("auth.nav.recommendations")}
          note={
            recommendations.some((r) => r.status === "Acquired")
              ? `${recommendations.filter((r) => r.status === "Acquired").length} acquired`
              : undefined
          }
        />
        <Stat
          to="/account/contributions"
          n={contributions.filter((c) => c.kind !== "review").length}
          label={t("auth.nav.contributions")}
          note={
            contributions.some((c) => c.kind !== "review" && c.status === "Needs Revision")
              ? "Needs your revision"
              : undefined
          }
        />
        <Stat
          to="/account/reviews"
          n={contributions.filter((c) => c.kind === "review").length}
          label={t("auth.nav.reviews")}
          note={
            contributions.some((c) => c.kind === "review" && c.status === "Needs Revision")
              ? "Needs your revision"
              : undefined
          }
        />
      </div>

      {loading ? (
        <div className="grid gap-12 lg:grid-cols-2" role="status" aria-busy="true">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error || !data ? (
        <ErrorState
          title={t("lending.loadError")}
          message={error ?? ""}
          retryLabel={t("lending.retry")}
          onRetry={reload}
        />
      ) : (
        <>
          {actions.length > 0 && (
            <Block title={t("lending.dash.pending")}>
              <ul className="divide-y divide-border">
                {actions.map((a) => (
                  <li
                    key={a.key}
                    className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[20px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 text-accent" />
                    <span className="break-words text-sm">{a.text}</span>
                    <span className="col-start-2 sm:col-start-auto">
                      <DetailsLink to={a.to} params={a.params}>
                        {a.label}
                      </DetailsLink>
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <div className="grid gap-12 lg:grid-cols-2">
            <Block
              title={t("lending.dash.currentLoans")}
              link={<More to="/account/borrowed">{t("lending.dash.allLoans")}</More>}
            >
              {current.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">{t("lending.dash.noLoans")}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {current.slice(0, 4).map((l) => {
                    const left = daysBetween(today, l.due_date);
                    return (
                      <li
                        key={l.id}
                        className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 py-3"
                      >
                        <BookThumb book={l.book} fallbackTitle={l.book_title} size="sm" />
                        <Link
                          to="/account/requests/$id"
                          params={{ id: l.request_id ?? l.id }}
                          className="min-w-0 hover:text-accent"
                        >
                          <div className="break-words font-display text-lg leading-snug">
                            {bookTitleOf(l.book, lang, l.book_title)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t("lending.loans.due")}
                            {fmt.date(l.due_date)}
                          </div>
                        </Link>
                        {l.derived_status === "Overdue" ? (
                          <ToneBadge label={t("lending.st.overdue")} tone="bad" />
                        ) : (
                          <span className="text-right text-sm text-muted-foreground">
                            {left === 0
                              ? t("lending.loans.dueToday")
                              : left === 1
                                ? t("lending.loans.dueTomorrow")
                                : t("lending.loans.dueIn", { n: left })}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Block>

            <Block
              title={t("lending.dash.recentRequests")}
              link={<More to="/account/requests">{t("lending.dash.allRequests")}</More>}
            >
              {recentReq.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">{t("lending.dash.noRequests")}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recentReq.map((r) => {
                    const sv = requestStatusView(r.status);
                    return (
                      <li
                        key={r.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3"
                      >
                        <Link
                          to="/account/requests/$id"
                          params={{ id: r.id }}
                          className="min-w-0 hover:text-accent"
                        >
                          <div className="break-words font-display text-lg leading-snug">
                            {bookTitleOf(r.book, lang, r.book_title)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-mono">{r.id}</span> ·{" "}
                            {r.status === "Pending"
                              ? t("lending.req.collectBy", { date: fmt.date(r.expires_at) })
                              : fmt.date(r.decided_at ?? r.created_at)}
                          </div>
                        </Link>
                        <ToneBadge label={t(sv.key)} tone={sv.tone} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Block>
          </div>
        </>
      )}
    </div>
  );
}

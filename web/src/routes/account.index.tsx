import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Headphones } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BookCover, Cover, fmtDate, StatusBadge, taka } from "@/components/noholi";
import { kindLabel } from "@/components/contribution-list";
import { DetailsLink } from "@/components/record-view";
import {
  audiobooks,
  fineOutstanding,
  fines,
  getBook,
  loans,
  readingActivity,
  user,
} from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "My library overview \u2014 My Noholi" },
      {
        name: "description",
        content: "Your Noholi membership, loans, requests and contributions at a glance.",
      },
      { property: "og:title", content: "My library overview \u2014 My Noholi" },
      {
        property: "og:description",
        content: "Your Noholi membership, loans, requests and contributions at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const TODAY = "2026-10-03"; // demo "today", matching the sample records
const daysLeft = (d: string) =>
  Math.round((new Date(d).getTime() - new Date(TODAY).getTime()) / 86400000);

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
    <section className="border-t border-foreground pt-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl">{title}</h2>
        {link}
      </div>
      {children}
    </section>
  );
}

function Stat({
  to,
  search,
  n,
  label,
  note,
}: {
  to: string;
  search?: Record<string, string>;
  n: ReactNode;
  label: string;
  note?: string;
}) {
  return (
    <Link
      to={to}
      search={search as never}
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
  const { borrowRequests, contributions, play, lang } = useApp();
  const current = loans.filter((l) => l.status === "Active" || l.status === "Overdue");
  const overdue = loans.filter((l) => l.status === "Overdue");
  const owed = fines.reduce((s, f) => s + fineOutstanding(f), 0);
  const pendingReq = borrowRequests.filter((r) =>
    ["Pending Review", "Approved", "Ready for Pickup"].includes(r.status),
  );
  const pendingReviews = contributions.filter(
    (c) => c.kind === "review" && c.status === "Pending Review",
  );
  const revisions = contributions.filter((c) => c.status === "Needs Revision");
  const recentReq = [...borrowRequests]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 4);
  const recentContrib = [...contributions]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 4);
  const ebook = readingActivity[0]!,
    audio = readingActivity[1]!;
  const eb = getBook(ebook.id)!,
    au = audiobooks.find((a) => a.id === audio.id)!;

  const actions: {
    key: string;
    text: ReactNode;
    to: string;
    params?: Record<string, string>;
    label: string;
  }[] = [
    ...overdue.map((l) => ({
      key: l.id,
      text: (
        <>
          <strong>{getBook(l.bookId)!.titleEn}</strong> is {-daysLeft(l.due)} days overdue
        </>
      ),
      to: "/account/requests/$id",
      params: { id: l.requestId },
      label: "View loan",
    })),
    ...borrowRequests
      .filter((r) => r.status === "Ready for Pickup")
      .map((r) => ({
        key: r.id,
        text: (
          <>
            <strong>{getBook(r.bookId)!.titleEn}</strong> is ready to collect at the front desk
          </>
        ),
        to: "/account/requests/$id",
        params: { id: r.id },
        label: "View request",
      })),
    ...revisions.map((c) => ({
      key: c.id,
      text: (
        <>
          Editors asked for changes to <strong>{c.title}</strong>
        </>
      ),
      to: "/account/contributions/$id",
      params: { id: c.id },
      label: "See feedback",
    })),
    ...fines
      .filter((f) => fineOutstanding(f) > 0)
      .map((f) => ({
        key: f.id,
        text: (
          <>
            Fine {f.id}: {taka(fineOutstanding(f))} to settle at the front desk
          </>
        ),
        to: "/account/fines/$id",
        params: { id: f.id },
        label: "View fine",
      })),
  ];

  return (
    <div className="space-y-12">
      <section>
        <div className="eyebrow mb-3">Saturday, 3 October</div>
        <h1 className="text-5xl leading-tight md:text-6xl">
          {lang === "bn" ? "শুভ সন্ধ্যা, অর্ক।" : "Good evening, Aurko."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Member since {fmtDate(user.since)} · Free membership
        </p>
        <p className="mt-4 inline-flex items-center gap-2 border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
          Demonstration data — these loans, requests and submissions are sample records, not a real
          library account.
        </p>
      </section>

      <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-5">
        <Stat to="/account/borrowed" n={current.length} label="Currently borrowed" />
        <Stat
          to="/account/requests"
          n={pendingReq.length}
          label="Pending requests"
          note={
            pendingReq.some((r) => r.status === "Ready for Pickup")
              ? "1 ready for pickup"
              : undefined
          }
        />
        <Stat
          to="/account/fines"
          n={overdue.length}
          label="Overdue books"
          note={owed ? `${taka(owed)} fines due` : undefined}
        />
        <Stat
          to="/account/reviews"
          search={{ s: "Pending Review" }}
          n={pendingReviews.length}
          label="Pending reviews"
        />
        <Stat
          to="/account/contributions"
          n={contributions.length}
          label="My contributions"
          note={revisions.length ? `${revisions.length} need revision` : undefined}
        />
      </div>

      {actions.length > 0 && (
        <Block title="Pending actions">
          <ul className="divide-y divide-border">
            {actions.map((a) => (
              <li
                key={a.key}
                className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[20px_minmax(0,1fr)_auto] sm:items-center"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 text-accent" />
                <span className="text-sm">{a.text}</span>
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
        <Block title="Current loans" link={<More to="/account/borrowed">All loans</More>}>
          <ul className="divide-y divide-border">
            {current.map((l) => {
              const bk = getBook(l.bookId)!;
              const dl = daysLeft(l.due);
              return (
                <li
                  key={l.id}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 py-3"
                >
                  <BookCover book={bk} size="sm" />
                  <Link
                    to="/account/requests/$id"
                    params={{ id: l.requestId }}
                    className="min-w-0 hover:text-accent"
                  >
                    <div className="truncate font-display text-lg">{bk.titleEn}</div>
                    <div className="text-xs text-muted-foreground">Due {fmtDate(l.due)}</div>
                  </Link>
                  {dl < 0 ? (
                    <StatusBadge status="Overdue" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{dl} days left</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Block>

        <Block
          title="Recent borrow activity"
          link={<More to="/account/requests">All requests</More>}
        >
          <ul className="divide-y divide-border">
            {recentReq.map((r) => {
              const bk = getBook(r.bookId)!;
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
                    <div className="truncate font-display text-lg">{bk.titleEn}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{r.id}</span> ·{" "}
                      {r.timeline[r.timeline.length - 1]!.label} · {fmtDate(r.updated)}
                    </div>
                  </Link>
                  <StatusBadge status={r.status} />
                </li>
              );
            })}
          </ul>
        </Block>
      </div>

      <Block
        title="Recent contributions"
        link={<More to="/account/contributions">All contributions</More>}
      >
        <ul className="divide-y divide-border">
          {recentContrib.map((c) => (
            <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
              <Link
                to="/account/contributions/$id"
                params={{ id: c.id }}
                className="min-w-0 hover:text-accent"
              >
                <div className="truncate font-display text-lg">{c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {kindLabel[c.kind]} · updated {fmtDate(c.updated)}
                </div>
              </Link>
              <StatusBadge status={c.status} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/account/contribute" search={{ type: "blog" }}>
              Submit a Blog
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/account/contribute" search={{ type: "creative" }}>
              Submit Creative Writing
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/account/contribute" search={{ type: "review" }}>
              Write a Book Review
            </Link>
          </Button>
        </div>
      </Block>

      <Block title="Reading & listening">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/read/$id"
            params={{ id: eb.id }}
            className="group grid grid-cols-[72px_minmax(0,1fr)] gap-5 border border-border p-5 hover:border-foreground/40"
          >
            <BookCover book={eb} size="sm" />
            <div className="flex flex-col">
              <div className="eyebrow flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" /> Reading history
              </div>
              <div className="mt-2 font-bangla text-xl">{eb.titleBn}</div>
              <div className="text-sm text-muted-foreground">{eb.authorEn}</div>
              <div className="mt-auto pt-3">
                <div className="h-1 bg-border">
                  <div className="h-full bg-accent" style={{ width: `${ebook.progress * 100}%` }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {Math.round(ebook.progress * 100)}% · {ebook.when} · Continue
                </div>
              </div>
            </div>
          </Link>
          <button
            onClick={() => play(au.id)}
            className="group grid grid-cols-[72px_minmax(0,1fr)] gap-5 border border-border p-5 text-left hover:border-foreground/40"
          >
            <Cover title={au.titleBn} author="" tone={au.tone} size="sm" />
            <div className="flex flex-col">
              <div className="eyebrow flex items-center gap-2">
                <Headphones className="h-3.5 w-3.5" /> Listening history
              </div>
              <div className="mt-2 font-display text-xl">{au.titleEn}</div>
              <div className="text-sm text-muted-foreground">Read by {au.narrator}</div>
              <div className="mt-auto pt-3">
                <div className="h-1 bg-border">
                  <div className="h-full bg-accent" style={{ width: `${audio.progress * 100}%` }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {Math.round(audio.progress * 100)}% · {audio.when} · Resume
                </div>
              </div>
            </div>
          </button>
        </div>
      </Block>
    </div>
  );
}

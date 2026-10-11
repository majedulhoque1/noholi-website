import { Link, useNavigate } from "@tanstack/react-router";
import { fmtDate, Initials, Stars } from "@/components/noholi";
import { MemberButton, reasons } from "@/components/member-gate";
import { articles, communityReviews } from "@/lib/data";

/** Reviews block for any book / e-book / audio book detail page. */
export function ReviewsSection({ itemId, title }: { itemId: string; title: string }) {
  const nav = useNavigate();
  const list = communityReviews.filter((r) => r.itemId === itemId);
  const essays = articles.filter((a) => a.kind === "review" && a.bookId === itemId);
  const all = [...list.map((r) => r.rating), ...essays.map((e) => e.rating ?? 0).filter(Boolean)];
  const avg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  const write = () => nav({ to: "/account/contribute", search: { type: "review", book: itemId } });

  return (
    <section className="container-page mt-16" aria-labelledby="reviews-h">
      <div className="grid gap-8 rule-top pt-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="eyebrow">Readers on this book</div>
          <h2 id="reviews-h" className="mt-2 text-3xl">Reviews</h2>
          {all.length ? (
            <div className="mt-5"><div className="font-display text-5xl tabular-nums">{avg.toFixed(1)}</div><div className="mt-1 flex items-center gap-2"><Stars n={Math.round(avg)} /><span className="text-sm text-muted-foreground">{all.length} review{all.length > 1 ? "s" : ""}</span></div></div>
          ) : <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Be the first to tell other readers about <em>{title}</em>.</p>}
          <MemberButton reason={reasons.review} onAllowed={write} variant="outline" className="mt-6">Write a Review</MemberButton>
          <p className="mt-2 text-xs text-muted-foreground">Reviews are read by our editors before they appear.</p>
        </div>
        <div>
          {essays.map((e) => (
            <Link key={e.slug} to="/article/$slug" params={{ slug: e.slug }} className="group mb-6 block border-l-2 border-accent pl-5">
              <div className="eyebrow">Featured review · Write Ups</div>
              <div className="mt-1 font-display text-2xl group-hover:text-accent">{e.title}</div>
              <p className="mt-1 text-muted-foreground">{e.excerpt}</p>
              <div className="mt-2 text-sm">{e.author} · {fmtDate(e.date)}</div>
            </Link>
          ))}
          <ul className="divide-y divide-border">
            {list.map((r) => (
              <li key={r.id} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 py-5">
                <Initials name={r.name} className="h-10 w-10 text-base" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 text-sm"><span className="font-medium">{r.name}</span><span className="text-muted-foreground">{fmtDate(r.date)}</span><Stars n={r.rating} /></div>
                  <div className="mt-1 font-display text-xl">{r.title}</div>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{r.text}</p>
                  {r.tags && <div className="mt-2 text-xs text-muted-foreground">{r.recommend && "Recommends · "}{r.tags.join(" · ")}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

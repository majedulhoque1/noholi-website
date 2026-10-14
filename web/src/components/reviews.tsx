import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MemberButton, reasons } from "@/components/member-gate";
import { fmtDate, Stars } from "@/components/noholi";
import { articles } from "@/lib/data";
import { describeError, supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";

/** Reviews block for any book / e-book / audio book detail page. */
export function ReviewsSection({ itemId }: { itemId: string; title?: string }) {
  const { t } = useApp();
  // Member reviews have no backend yet, so the community-review list is never rendered (the sample
  // records in data.ts are not real readers). Editorial review essays stay, as sample content.
  const essays = articles.filter((a) => a.kind === "review" && a.bookId === itemId);
  const all = essays.map((e) => e.rating ?? 0).filter(Boolean);
  const avg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;

  return (
    <section className="container-page mt-16" aria-labelledby="reviews-h">
      <div className="grid gap-8 rule-top pt-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="eyebrow">Readers on this book</div>
          <h2 id="reviews-h" className="mt-2 text-3xl">
            Reviews
          </h2>
          {all.length ? (
            <div className="mt-5">
              <div className="font-display text-5xl tabular-nums">{avg.toFixed(1)}</div>
              <div className="mt-1 flex items-center gap-2">
                <Stars n={Math.round(avg)} />
                <span className="text-sm text-muted-foreground">
                  {all.length} review{all.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t("forms.soon.reviews")}</p>
          )}
          <Button variant="outline" className="mt-6" disabled title={t("forms.soon.writeReview")}>
            Write a Review
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{t("forms.soon.writeReview")}</p>
        </div>
        <div>
          {essays.map((e) => (
            <Link
              key={e.slug}
              to="/article/$slug"
              params={{ slug: e.slug }}
              className="group mb-6 block border-l-2 border-accent pl-5"
            >
              <div className="eyebrow">Featured review · Write Ups</div>
              <div className="mt-1 font-display text-2xl group-hover:text-accent">{e.title}</div>
              <p className="mt-1 text-muted-foreground">{e.excerpt}</p>
              <div className="mt-2 text-sm">
                {e.author} · {fmtDate(e.date)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

type PublicReview = {
  id: string;
  member_name: string;
  rating: number;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
};

/** Reviews block for a live catalogue book: editor-approved member reviews only. */
export function BookReviewsSection({ bookId }: { bookId: string }) {
  const { t } = useApp();
  const nav = useNavigate();
  const [rows, setRows] = useState<PublicReview[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void supabase.rpc("book_reviews", { p_book_id: bookId }).then(({ data, error }) => {
      if (!live) return;
      if (error) setErr(describeError(error));
      else setRows((data ?? []) as PublicReview[]);
    });
    return () => {
      live = false;
    };
  }, [bookId]);
  const list = rows ?? [];
  const avg = list.length ? list.reduce((a, r) => a + r.rating, 0) / list.length : 0;
  return (
    <section className="container-page mt-16" aria-labelledby="reviews-h">
      <div className="grid gap-8 rule-top pt-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="eyebrow">{t("ux.book.reviewsEyebrow")}</div>
          <h2 id="reviews-h" className="mt-2 text-3xl">
            {t("ux.book.reviews")}
          </h2>
          {list.length ? (
            <div className="mt-5">
              <div className="font-display text-5xl tabular-nums">{avg.toFixed(1)}</div>
              <div className="mt-1 flex items-center gap-2">
                <Stars n={Math.round(avg)} />
                <span className="text-sm text-muted-foreground">
                  {list.length} review{list.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              {err ?? (rows ? t("ux.book.noReviews") : "")}
            </p>
          )}
          <MemberButton
            reason={reasons.review}
            onAllowed={() =>
              nav({ to: "/account/contribute", search: { type: "review", book: bookId } })
            }
            variant="outline"
            className="mt-6"
          >
            {t("ux.book.writeReview")}
          </MemberButton>
        </div>
        {list.length > 0 && (
          <ul className="divide-y divide-border">
            {list.map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex items-center gap-3">
                  <Stars n={r.rating} />
                  <span className="text-sm text-muted-foreground">
                    {r.member_name} · {fmtDate(r.created_at.slice(0, 10))}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl">{r.title}</h3>
                {r.content && (
                  <p className="mt-2 whitespace-pre-line text-muted-foreground">{r.content}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

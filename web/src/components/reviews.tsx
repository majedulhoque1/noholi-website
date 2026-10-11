import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MemberButton, reasons } from "@/components/member-gate";
import { fmtDate, Stars } from "@/components/noholi";
import { articles } from "@/lib/data";
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

/**
 * Reviews block for a live catalogue book. Reader reviews have no backend yet, so this is an honest
 * empty state with the reference's structure; the button goes to the (coming-soon) reviews page.
 */
export function BookReviewsSection() {
  const { t } = useApp();
  const nav = useNavigate();
  return (
    <section className="container-page mt-16" aria-labelledby="reviews-h">
      <div className="grid gap-8 rule-top pt-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="eyebrow">{t("ux.book.reviewsEyebrow")}</div>
          <h2 id="reviews-h" className="mt-2 text-3xl">
            {t("ux.book.reviews")}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">{t("ux.book.noReviews")}</p>
          <MemberButton
            reason={reasons.review}
            onAllowed={() => nav({ to: "/account/reviews" })}
            variant="outline"
            className="mt-6"
          >
            {t("ux.book.writeReview")}
          </MemberButton>
        </div>
      </div>
    </section>
  );
}

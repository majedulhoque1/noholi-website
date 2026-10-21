import { useNavigate } from "@tanstack/react-router";
import { MemberButton, reasons } from "@/components/member-gate";
import { cn } from "@/lib/utils";

/**
 * The "Contribute to Noholi" call to action, shared by Blogs, Creative Writings and Book Reviews.
 * Each action keeps the membership gate: logged-out visitors are asked to sign in or join first.
 */
export function ContributePanel({ className }: { className?: string }) {
  const nav = useNavigate();
  const go = (type: "blog" | "creative" | "review") => () =>
    nav({ to: "/account/contribute", search: { type } });
  return (
    <aside
      aria-labelledby="contribute-h"
      className={cn("container-page my-16 md:my-20", className)}
    >
      <div className="grid gap-6 border border-border bg-secondary/60 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 md:p-10">
        <div className="max-w-xl border-l-2 border-accent pl-5">
          <div className="eyebrow">Contribute to Noholi</div>
          <h2 id="contribute-h" className="mt-2 text-2xl leading-snug md:text-3xl">
            Become part of the community.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Members can share essays, poems, stories and reviews. Editors read every piece first.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 md:w-[19rem] md:grid-cols-1">
          <MemberButton
            reason={reasons.contribute}
            onAllowed={go("blog")}
            className="justify-start"
          >
            Submit a Blog
          </MemberButton>
          <MemberButton
            reason={reasons.contribute}
            onAllowed={go("creative")}
            variant="outline"
            className="justify-start"
          >
            Submit Creative Writing
          </MemberButton>
          <MemberButton
            reason={reasons.review}
            onAllowed={go("review")}
            variant="outline"
            className="justify-start"
          >
            Write a Book Review
          </MemberButton>
        </div>
      </div>
    </aside>
  );
}

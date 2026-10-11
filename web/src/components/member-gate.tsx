import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";

/** The one "Member Access Required" prompt. Rendered once in the root; opened via askMember / requireMember. */
export function MemberPromptHost() {
  const { memberPrompt, closeMemberPrompt } = useApp();
  return (
    <Dialog open={!!memberPrompt} onOpenChange={(o) => !o && closeMemberPrompt()}>
      <DialogContent className="rounded-sm sm:max-w-md">
        <div className="mb-2 flex gap-1.5" aria-hidden>
          {[0, 2, 5].map((t) => (
            <span
              key={t}
              className="h-10 w-2 rounded-[1px]"
              style={{ background: `var(--cover-${t})` }}
            />
          ))}
        </div>
        <div className="eyebrow">Members only</div>
        <DialogTitle className="font-display text-3xl font-normal leading-tight">
          Become part of Noholi
        </DialogTitle>
        <DialogDescription className="text-base">{memberPrompt}</DialogDescription>
        <p className="text-sm text-muted-foreground">
          A free membership lets you borrow books, write reviews, contribute your writing and
          recommend books to the library.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" asChild onClick={closeMemberPrompt}>
            <Link to="/login">Log In</Link>
          </Button>
          <Button variant="accent" asChild onClick={closeMemberPrompt}>
            <Link to="/join">Become a Member</Link>
          </Button>
        </div>
        <p className="text-center text-xs font-medium">Membership is free.</p>
      </DialogContent>
    </Dialog>
  );
}

/** A button for a member-only action: runs onAllowed for members, shows the prompt for visitors. */
export function MemberButton({
  reason,
  onAllowed,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & { reason: string; onAllowed: () => void }) {
  const { requireMember } = useApp();
  return <Button {...props} onClick={() => requireMember(reason, onAllowed)} />;
}

export const reasons = {
  borrow: "Log in or become a free member to request this book.",
  review: "Log in or become a free member to write a review.",
  contribute: "Log in or become a free member to submit your work.",
  recommend: "Log in or become a free member to recommend something for Noholi.",
};

import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/book-reviews/$slug` -> `/writeups/reviews` (permanent).
export const Route = createFileRoute("/book-reviews/$slug")({
  beforeLoad: () => {
    throw redirect({ to: "/writeups/reviews", statusCode: 301 });
  },
});

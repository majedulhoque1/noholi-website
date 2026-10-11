import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/book-reviews` -> `/writeups/reviews` (permanent).
export const Route = createFileRoute("/book-reviews")({
  beforeLoad: () => {
    throw redirect({ to: "/writeups/reviews", statusCode: 301 });
  },
});

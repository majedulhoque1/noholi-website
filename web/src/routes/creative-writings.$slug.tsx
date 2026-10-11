import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/creative-writings/$slug` -> `/writeups/creative` (permanent).
export const Route = createFileRoute("/creative-writings/$slug")({
  beforeLoad: () => {
    throw redirect({ to: "/writeups/creative", statusCode: 301 });
  },
});

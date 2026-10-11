import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/creative-writings` -> `/writeups/creative` (permanent).
export const Route = createFileRoute("/creative-writings")({
  beforeLoad: () => {
    throw redirect({ to: "/writeups/creative", statusCode: 301 });
  },
});

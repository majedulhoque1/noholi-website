import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/become-a-member` -> `/join` (permanent).
export const Route = createFileRoute("/become-a-member")({
  beforeLoad: () => {
    throw redirect({ to: "/join", statusCode: 301 });
  },
});

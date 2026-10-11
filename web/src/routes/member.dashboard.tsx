import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/member/dashboard` -> `/account` (permanent).
export const Route = createFileRoute("/member/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/account", statusCode: 301 });
  },
});

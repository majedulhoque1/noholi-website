import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/member/profile` -> `/account/profile` (permanent).
export const Route = createFileRoute("/member/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/account/profile", statusCode: 301 });
  },
});

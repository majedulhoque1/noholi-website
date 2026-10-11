import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/member/edit` -> `/account/profile` (permanent).
export const Route = createFileRoute("/member/edit")({
  beforeLoad: () => {
    throw redirect({ to: "/account/profile", statusCode: 301 });
  },
});

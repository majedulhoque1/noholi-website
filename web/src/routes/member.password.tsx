import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/member/password` -> `/account/password` (permanent).
export const Route = createFileRoute("/member/password")({
  beforeLoad: () => {
    throw redirect({ to: "/account/password", statusCode: 301 });
  },
});

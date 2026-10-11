import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/rules` -> `/library/rules` (permanent).
export const Route = createFileRoute("/rules")({
  beforeLoad: () => {
    throw redirect({ to: "/library/rules", statusCode: 301 });
  },
});

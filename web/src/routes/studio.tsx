import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/studio` -> `/account/contribute` (permanent).
export const Route = createFileRoute("/studio")({
  beforeLoad: () => {
    throw redirect({ to: "/account/contribute", statusCode: 301 });
  },
});

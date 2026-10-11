import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/noholi-books` -> `/library/noholi` (permanent).
export const Route = createFileRoute("/noholi-books")({
  beforeLoad: () => {
    throw redirect({ to: "/library/noholi", statusCode: 301 });
  },
});

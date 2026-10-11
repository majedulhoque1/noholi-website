import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/e-books` -> `/library/ebooks` (permanent).
export const Route = createFileRoute("/e-books")({
  beforeLoad: () => {
    throw redirect({ to: "/library/ebooks", statusCode: 301 });
  },
});

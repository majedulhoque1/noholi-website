import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/catalog` -> `/library/books` (permanent).
export const Route = createFileRoute("/catalog")({
  beforeLoad: () => {
    throw redirect({ to: "/library/books", statusCode: 301 });
  },
});

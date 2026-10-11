import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/gallery` -> `/library/gallery` (permanent).
export const Route = createFileRoute("/gallery")({
  beforeLoad: () => {
    throw redirect({ to: "/library/gallery", statusCode: 301 });
  },
});

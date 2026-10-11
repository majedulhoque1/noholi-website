import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/audio-books/$slug` -> `/library/audio` (permanent).
export const Route = createFileRoute("/audio-books/$slug")({
  beforeLoad: () => {
    throw redirect({ to: "/library/audio", statusCode: 301 });
  },
});

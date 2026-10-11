import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/audio-books` -> `/library/audio` (permanent).
export const Route = createFileRoute("/audio-books")({
  beforeLoad: () => {
    throw redirect({ to: "/library/audio", statusCode: 301 });
  },
});

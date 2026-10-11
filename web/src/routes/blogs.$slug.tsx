import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/blogs/$slug` -> `/writeups/blogs` (permanent).
export const Route = createFileRoute("/blogs/$slug")({
  beforeLoad: () => {
    throw redirect({ to: "/writeups/blogs", statusCode: 301 });
  },
});

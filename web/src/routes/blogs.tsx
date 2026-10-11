import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/blogs` -> `/writeups/blogs` (permanent).
export const Route = createFileRoute("/blogs")({
  beforeLoad: () => {
    throw redirect({ to: "/writeups/blogs", statusCode: 301 });
  },
});

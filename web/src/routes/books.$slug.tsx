import { createFileRoute, redirect } from "@tanstack/react-router";
import { bookIdFromSlug } from "@/lib/legacy-redirects";

// Legacy URL `/books/bk-0001-title` -> `/book/BK-0001` (permanent). Anything else -> the catalogue.
export const Route = createFileRoute("/books/$slug")({
  beforeLoad: ({ params }) => {
    const id = bookIdFromSlug(params.slug);
    if (id) throw redirect({ to: "/book/$id", params: { id }, statusCode: 301 });
    throw redirect({ to: "/library/books", statusCode: 301 });
  },
});

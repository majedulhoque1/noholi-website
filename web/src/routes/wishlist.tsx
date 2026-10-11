import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL `/wishlist` -> `/account/wishlist` (permanent).
export const Route = createFileRoute("/wishlist")({
  beforeLoad: () => {
    throw redirect({ to: "/account/wishlist", statusCode: 301 });
  },
});

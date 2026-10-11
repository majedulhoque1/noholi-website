import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/noholi";
import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Noholi — Patron account" },
      { name: "description", content: "Your Noholi dashboard, loans, borrow requests, wishlist and settings." },
      { property: "og:title", content: "My Noholi" },
      { property: "og:description", content: "Patron account at Noholi Library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  // The Supabase session lives in localStorage, so member pages render in the browser only.
  ssr: false,
  component: AccountLayout,
});

const tabs = [
  ["/account", "Dashboard"], ["/account/borrowed", "Borrowed"], ["/account/requests", "Borrow requests"], ["/account/fines", "Overdue & Fines"],
  ["/account/wishlist", "Wishlist"], ["/account/recommendations", "Recommendations"], ["/account/contributions", "Contributions"], ["/account/reviews", "Book Reviews"], ["/account/profile", "Profile"], ["/account/settings", "Settings"],
] as const;

function AccountLayout() {
  const { loggedIn } = useApp();
  const { ready, member, memberError } = useAuth();
  // Wait for the stored session to be checked before deciding (no flash of the "members only" screen).
  if (!ready) return <div className="container-page max-w-lg py-32 text-center text-sm text-muted-foreground" role="status">Loading your account…</div>;
  if (!loggedIn) {
    return (
      <div className="container-page max-w-lg py-32 text-center">
        <div className="eyebrow mb-4">Members only</div>
        <h1 className="text-5xl">Become a Noholi member</h1>
        <p className="mt-3 text-muted-foreground">Your profile, dashboard, borrowing and contributions live here. Membership is free.</p>
        <div className="mt-8 flex justify-center gap-3"><Button asChild><Link to="/login">Log In</Link></Button><Button variant="accent" asChild><Link to="/join">Become a Member</Link></Button></div>
      </div>
    );
  }
  return (
    <>
      <div className="border-b border-border">
        <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pt-10">
          <div className="flex min-w-0 items-center gap-4 pb-6">
            <MemberAvatar className="h-14 w-14" textClass="text-2xl" />
            <div className="min-w-0">
              <div className="truncate font-display text-2xl">{member?.name ?? "Your account"}</div>
              <div className="text-sm text-muted-foreground">
                {member ? <>{member.id} · {member.status === "Active" ? <span className="text-success">● Active Patron</span> : <span className="text-warning">● {member.status}</span>}</> : memberError ?? ""}
              </div>
            </div>
          </div>
        </div>
        <nav className="container-page flex gap-6 overflow-x-auto" aria-label="Account">
          {tabs.map(([to, l]) => <Link key={to} to={to} activeOptions={{ exact: true }} className="-mb-px whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-muted-foreground hover:text-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground">{l}</Link>)}
        </nav>
      </div>
      <div className="container-page py-12"><Outlet /></div>
    </>
  );
}

import {
  createFileRoute,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/noholi";
import { MemberLoadState, MemberStatus } from "@/components/member-ui";
import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Noholi — Patron account" },
      {
        name: "description",
        content: "Your Noholi dashboard, loans, borrow requests, wishlist and settings.",
      },
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
  { to: "/account", k: "auth.nav.dashboard" },
  { to: "/account/borrowed", k: "auth.nav.borrowed" },
  { to: "/account/requests", k: "auth.nav.requests" },
  { to: "/account/fines", k: "auth.nav.fines" },
  { to: "/account/wishlist", k: "auth.nav.wishlist" },
  { to: "/account/recommendations", k: "auth.nav.recommendations" },
  { to: "/account/contributions", k: "auth.nav.contributions" },
  { to: "/account/reviews", k: "auth.nav.reviews" },
  { to: "/account/profile", k: "auth.nav.profile" },
  { to: "/account/settings", k: "auth.nav.settings" },
] as const;

const PASSWORD_PATH = "/account/password";

function AccountLayout() {
  const { t, logout } = useApp();
  const { ready, session, member, mustChangePassword } = useAuth();
  const { pathname } = useLocation();
  const nav = useNavigate();

  // Wait for the stored session to be checked before deciding (no flash of the "members only" screen).
  if (!ready) return <MemberLoadState loadingLabel={t("auth.loadingAccount")} />;
  if (!session) {
    return (
      <div className="container-page max-w-lg py-32 text-center">
        <div className="eyebrow mb-4">{t("auth.membersOnly")}</div>
        <h1 className="text-5xl">{t("auth.membersOnlyTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("auth.membersOnlyBody")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/login" search={{ redirect: pathname }}>
              {t("login")}
            </Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/join">{t("become")}</Link>
          </Button>
        </div>
      </div>
    );
  }
  // A real session, but the member row is still loading or failed to load (never show fake data).
  if (!member) {
    return (
      <div className="container-page">
        <MemberLoadState />
      </div>
    );
  }

  // Temporary password from the desk: nothing else in /account opens until it is replaced.
  const held = mustChangePassword;
  if (held && pathname !== PASSWORD_PATH) return <Navigate to={PASSWORD_PATH} replace />;

  return (
    <>
      <div className="border-b border-border">
        <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pt-10">
          <div className="flex min-w-0 items-center gap-4 pb-6">
            <MemberAvatar className="h-14 w-14" textClass="text-2xl" />
            <div className="min-w-0">
              <div className="truncate font-display text-2xl">{member.name}</div>
              <div className="text-sm text-muted-foreground">
                {member.id} · <MemberStatus status={member.status} />
              </div>
            </div>
          </div>
          {held && (
            <div className="pb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  nav({ to: "/" });
                }}
              >
                {t("logout")}
              </Button>
            </div>
          )}
        </div>
        {!held && (
          <nav
            className="container-page flex gap-5 overflow-x-auto [scrollbar-width:thin]"
            aria-label={t("auth.nav.label")}
          >
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                activeOptions={{ exact: true }}
                className="-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-muted-foreground hover:text-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground"
              >
                {t(tab.k)}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="container-page py-12">
        <Outlet />
      </div>
    </>
  );
}

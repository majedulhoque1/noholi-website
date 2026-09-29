import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Users, BookOpen, MoreHorizontal } from "lucide-react";
import { NAV_ITEMS, type UserRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** The four routes surfaced directly in the bottom tab bar; everything else lives behind "More". */
const PRIMARY_HREFS = ["/", "/lending", "/members", "/inventory"] as const;

const PRIMARY_ICON: Record<string, React.ElementType> = {
  "/": LayoutDashboard,
  "/lending": ArrowLeftRight,
  "/members": Users,
  "/inventory": BookOpen,
};

const PRIMARY_LABEL: Record<string, string> = {
  "/": "Home",
};

interface BottomTabBarProps {
  role: UserRole;
  onOpenMore: () => void;
}

/** Fixed bottom tab bar shown below md. Role-filtered; "More" opens the same drawer as the TopBar hamburger. */
export function BottomTabBar({ role, onOpenMore }: BottomTabBarProps) {
  const location = useLocation();

  const items = PRIMARY_HREFS.map((href) => NAV_ITEMS.find((item) => item.href === href)).filter(
    (item): item is NonNullable<typeof item> => !!item && item.roles.includes(role),
  );

  const moreActive = !PRIMARY_HREFS.includes(location.pathname as (typeof PRIMARY_HREFS)[number]);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const Icon = PRIMARY_ICON[item.href];
        const active = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[11px] transition-colors",
              active ? "text-accent" : "text-muted-foreground",
            )}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span className={cn(active && "font-medium")}>{PRIMARY_LABEL[item.href] ?? item.title}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMore}
        className={cn(
          "flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[11px] transition-colors",
          moreActive ? "text-accent" : "text-muted-foreground",
        )}
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className={cn(moreActive && "font-medium")}>More</span>
      </button>
    </nav>
  );
}

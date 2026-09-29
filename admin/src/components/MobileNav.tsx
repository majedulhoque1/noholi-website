import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { NAV_ITEMS, type UserRole } from "@/lib/navigation";
import { NAV_ICON_MAP } from "@/components/nav-icons";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Left slide-in drawer used below the md breakpoint: hamburger menu + bottom tab bar's "More" both open this. */
export function MobileNav({ role, open, onOpenChange }: MobileNavProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[78%] max-w-xs flex-col gap-0 p-0 motion-reduce:transition-none motion-reduce:duration-0"
      >
        <SheetHeader className="h-14 shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border px-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
            <img src="/noholi-logo.png" alt="" className="h-6 w-auto" />
            NOHOLI
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {visibleItems.map((item) => {
            const Icon = NAV_ICON_MAP[item.title];
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={close}
                className={cn(
                  "flex min-h-[44px] items-center gap-3 rounded px-3 py-2.5 text-[14px] transition-colors",
                  active
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-border px-2 py-2">
          <button
            type="button"
            onClick={() => {
              close();
              signOut();
            }}
            className="flex min-h-[44px] w-full items-center gap-3 rounded px-3 py-2.5 text-left text-[14px] text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
          <span className="block px-3 pt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {role}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

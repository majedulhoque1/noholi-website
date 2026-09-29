import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";
import { BottomTabBar } from "@/components/BottomTabBar";
import type { UserRole } from "@/lib/navigation";
import { RoleProvider } from "@/lib/roles";

interface AppLayoutProps {
  role: UserRole;
}

export function AppLayout({ role }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RoleProvider value={role}>
      <div className="flex h-[100dvh] w-full overflow-hidden">
        <AppSidebar role={role} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar onOpenMenu={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-auto p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:p-5 md:pb-5">
            <Outlet />
          </main>
        </div>
        <BottomTabBar role={role} onOpenMore={() => setMobileNavOpen(true)} />
      </div>
      <MobileNav role={role} open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </RoleProvider>
  );
}

import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, User, Users, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicySettings } from "./settings/PolicySettings";
import { AccountSettings } from "./settings/AccountSettings";
import { StaffSettings } from "./settings/StaffSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { BackupSettings } from "./settings/BackupSettings";

const TABS = [
  { id: "policy", label: "Policy", icon: SlidersHorizontal },
  { id: "account", label: "Account", icon: User },
  { id: "staff", label: "Staff", icon: Users },
  { id: "activity", label: "Activity log", icon: Shield },
  { id: "backup", label: "Backup", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const activeTab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : "policy";
  const setActiveTab = (id: TabId) => setParams(id === "policy" ? {} : { tab: id }, { replace: true });

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground">Library policy, your account, staff access, activity log and backups.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:gap-5">
        {/* Horizontally scrollable tab strip on mobile; vertical sidebar nav from md up (unchanged). */}
        <nav className="sticky top-0 z-10 -mx-4 flex gap-1 overflow-x-auto bg-background px-4 pb-2 md:static md:mx-0 md:w-48 md:shrink-0 md:flex-col md:space-y-0.5 md:overflow-visible md:bg-transparent md:px-0 md:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-3 py-2 text-[13px] transition-colors md:w-full md:text-left",
                  active
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeTab === "policy" && <PolicySettings />}
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "staff" && <StaffSettings />}
          {activeTab === "activity" && <SecuritySettings />}
          {activeTab === "backup" && <BackupSettings />}
        </div>
      </div>
    </div>
  );
}

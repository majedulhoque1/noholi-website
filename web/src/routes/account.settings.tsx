import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberLoadState } from "@/components/member-ui";
import { PasswordForm } from "@/components/password-form";
import { useAuth } from "@/lib/auth";
import { useMyPrefs, type Prefs } from "@/lib/member-prefs";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/settings")({
  head: () => ({
    meta: [
      { title: "Account settings — My Noholi" },
      {
        name: "description",
        content: "Manage your Noholi language, appearance and account security.",
      },
      { property: "og:title", content: "Account settings — My Noholi" },
      {
        property: "og:description",
        content: "Manage your Noholi language, appearance and account security.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-border py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <div className="font-medium">{title}</div>
        {desc && <div className="mt-1 text-sm text-muted-foreground">{desc}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex border border-border p-0.5">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={cn(
            "h-9 px-4 text-sm",
            value === v ? "bg-foreground text-background" : "text-muted-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Settings() {
  const { t, theme, setTheme, lang, setLang, logout } = useApp();
  const { member } = useAuth();
  const nav = useNavigate();
  const { prefs, setPref } = useMyPrefs(member?.id ?? null);
  if (!member) return <MemberLoadState />;
  const none = t("auth.settings.notOnRecord");
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-4xl">{t("auth.settings.title")}</h1>
      <Tabs defaultValue="general">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
          {[
            ["general", t("auth.settings.tabGeneral")],
            ["account", t("auth.settings.tabAccount")],
            ["security", t("auth.settings.tabSecurity")],
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="-mb-px flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general">
          <Row title={t("auth.settings.language")} desc={t("auth.settings.languageDesc")}>
            <Seg
              value={lang}
              options={[
                ["en", "English"],
                ["bn", "বাংলা"],
              ]}
              onChange={setLang}
            />
          </Row>
          <Row title={t("auth.settings.theme")}>
            <Seg
              value={theme}
              options={[
                ["light", t("auth.settings.light")],
                ["dark", t("auth.settings.dark")],
              ]}
              onChange={setTheme}
            />
          </Row>
          {(
            [
              [
                "due_date_reminders",
                "auth.settings.notifyDueDate",
                "auth.settings.notifyDueDateDesc",
              ],
              [
                "borrow_request_updates",
                "auth.settings.notifyRequests",
                "auth.settings.notifyRequestsDesc",
              ],
              [
                "contribution_decisions",
                "auth.settings.notifyContrib",
                "auth.settings.notifyContribDesc",
              ],
              ["new_noholi_books", "auth.settings.notifyBooks", "auth.settings.notifyBooksDesc"],
            ] as const satisfies readonly (readonly [keyof Prefs, string, string])[]
          ).map(([key, title, desc]) => (
            <Row key={key} title={t(title)} desc={t(desc)}>
              <Switch
                checked={prefs?.[key] ?? false}
                disabled={!prefs}
                aria-label={t(title)}
                onCheckedChange={(on) =>
                  setPref(key, on).catch(() => toast.error(t("auth.settings.prefsFailed")))
                }
              />
            </Row>
          ))}
        </TabsContent>
        <TabsContent value="account">
          <dl className="divide-y divide-border border-b border-border">
            {(
              [
                [t("auth.settings.fullName"), member.name],
                [t("auth.settings.memberId"), member.id],
                [t("auth.settings.email"), member.email || none],
                [t("auth.settings.phone"), member.phone || none],
              ] as const
            ).map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[160px_minmax(0,1fr)]"
              >
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">{t("auth.settings.deskNote")}</p>
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link to="/account/profile" search={{ edit: true }}>
                {t("auth.settings.editContact")}
              </Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <Row title={t("auth.settings.changePassword")}>
            <PasswordForm forced={false} onDone={() => toast(t("auth.pw.updated"))} />
          </Row>
          <Row title={t("auth.settings.signOut")} desc={t("auth.settings.signOutDesc")}>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                nav({ to: "/" });
              }}
            >
              {t("logout")}
            </Button>
          </Row>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PasswordForm } from "@/components/password-form";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/password")({
  head: () => ({
    meta: [
      { title: "Change password — My Noholi" },
      { name: "description", content: "Choose a new password for your Noholi patron account." },
      { property: "og:title", content: "Change password — My Noholi" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChangePassword,
});

// A member who signed in with a temporary password is held here by the /account layout until the
// change is done (the only way out is Log out). Anyone else can also open it voluntarily.
function ChangePassword() {
  const { t } = useApp();
  const { mustChangePassword } = useAuth();
  const nav = useNavigate();
  return (
    <div className="max-w-xl">
      <div className="eyebrow mb-4">{t("auth.pw.eyebrow")}</div>
      <h1 className="text-4xl">{t("auth.pw.title")}</h1>
      <p className="mt-3 text-muted-foreground">
        {mustChangePassword ? t("auth.pw.introForced") : t("auth.pw.introVoluntary")}
      </p>
      <div className="mt-8">
        <PasswordForm
          forced={mustChangePassword}
          onDone={() => {
            toast(t("auth.pw.updated"));
            nav({ to: "/account", replace: true });
          }}
        />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        {t("auth.pw.deskNote")}{" "}
        <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">
          {t("auth.login.contactLibrary")}
        </Link>
      </p>
    </div>
  );
}

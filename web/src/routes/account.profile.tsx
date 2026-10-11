import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, MemberAvatar } from "@/components/noholi";
import { MemberLoadState, MemberStatus } from "@/components/member-ui";
import { useAuth, type MemberRow } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { describeError, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/account/profile")({
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => ({
    edit:
      search["edit"] === true || search["edit"] === "true" || search["edit"] === 1
        ? true
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My profile — My Noholi" },
      { name: "description", content: "Review and update your Noholi patron profile." },
      { property: "og:title", content: "My profile — My Noholi" },
      { property: "og:description", content: "Review and update your Noholi patron profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

type Draft = { phone: string; street: string; city: string; district: string; postal: string };

const draftOf = (m: MemberRow): Draft => ({
  phone: m.phone ?? "",
  street: m.address_line ?? "",
  city: m.city ?? "",
  district: m.district ?? "",
  postal: m.postal_code ?? "",
});

/** Member-since date in Dhaka time. */
function sinceDate(raw: unknown, lang: string): string | null {
  if (typeof raw !== "string") return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Profile() {
  const { t, lang } = useApp();
  const { member, refreshMember } = useAuth();
  const search = Route.useSearch();
  const [edit, setEdit] = useState(Boolean(search["edit"]));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!member) return <MemberLoadState loadingLabel={t("auth.profile.loading")} />;

  const d = draft ?? draftOf(member);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft({ ...d, [k]: e.target.value });
  const since = sinceDate(member["created_at"], lang);
  const dash = t("auth.profile.notProvided");
  const address = [member.address_line, member.city, member.district, member.postal_code]
    .filter((x) => x && String(x).trim())
    .join(", ");

  const start = () => {
    setDraft(draftOf(member));
    setErr("");
    setEdit(true);
  };
  const cancel = () => {
    setEdit(false);
    setDraft(null);
    setErr("");
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!d.phone.trim()) {
      setErr(t("auth.profile.phoneRequired"));
      return;
    }
    setBusy(true);
    setErr("");
    try {
      // Only phone and address can be changed by a member (update_my_profile); '' clears a field.
      const { error } = await supabase.rpc("update_my_profile", {
        p_phone: d.phone.trim(),
        p_address_line: d.street.trim(),
        p_city: d.city.trim(),
        p_district: d.district.trim(),
        p_postal_code: d.postal.trim(),
      });
      if (error) throw error;
      await refreshMember();
      toast(t("auth.profile.saved"));
      setEdit(false);
      setDraft(null);
    } catch (error) {
      setErr(describeError(error));
    } finally {
      setBusy(false);
    }
  };

  const field = (
    id: keyof Draft,
    label: string,
    extra?: { placeholder?: string; auto?: string },
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`pf-${id}`}>{label}</Label>
      <Input
        id={`pf-${id}`}
        value={d[id]}
        onChange={set(id)}
        className="h-11"
        placeholder={extra?.placeholder}
        autoComplete={extra?.auto}
        disabled={busy}
      />
    </div>
  );

  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        {edit ? (
          <form onSubmit={save} noValidate>
            <h1 className="mb-8 text-4xl">{t("auth.profile.editTitle")}</h1>
            <div className="mb-8 grid gap-1 border-b border-border pb-6 text-sm">
              <div className="font-display text-xl">{member.name}</div>
              <div className="font-mono text-muted-foreground">{member.id}</div>
              <p className="mt-2 text-muted-foreground">{t("auth.profile.deskNote")}</p>
            </div>
            <div className="grid gap-5">
              {field("phone", t("auth.profile.phone"), { auto: "tel" })}
              {field("street", t("auth.profile.street"), {
                placeholder: t("auth.profile.streetPlaceholder"),
                auto: "street-address",
              })}
              <div className="grid gap-5 sm:grid-cols-3">
                {field("city", t("auth.profile.city"), { auto: "address-level2" })}
                {field("district", t("auth.profile.district"))}
                {field("postal", t("auth.profile.postal"), { auto: "postal-code" })}
              </div>
            </div>
            {err && (
              <p className="mt-5 text-sm text-destructive" role="alert">
                {err}
              </p>
            )}
            <div className="mt-8 flex gap-2">
              <Button type="submit" disabled={busy} aria-busy={busy}>
                {busy ? t("auth.profile.saving") : t("auth.profile.save")}
              </Button>
              <Button type="button" variant="ghost" onClick={cancel} disabled={busy}>
                {t("auth.profile.cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:flex-wrap sm:items-center">
              <MemberAvatar className="h-28 w-28" textClass="text-5xl" />
              <div className="min-w-[14rem] flex-1">
                <h1 className="text-4xl leading-tight">{member.name}</h1>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{member.id}</div>
                <div className="mt-2">
                  <span className="text-sm">
                    <MemberStatus status={member.status} />
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={start} className="self-start sm:self-center">
                {t("auth.profile.edit")}
              </Button>
            </div>
            <dl className="divide-y divide-border border-b border-border">
              <div className="grid grid-cols-[120px_minmax(0,1fr)] py-4">
                <dt className="text-sm text-muted-foreground">{t("auth.profile.email")}</dt>
                <dd className="break-words">{member.email || dash}</dd>
              </div>
              <div className="grid grid-cols-[120px_minmax(0,1fr)] py-4">
                <dt className="text-sm text-muted-foreground">{t("auth.profile.phone")}</dt>
                <dd>{member.phone || dash}</dd>
              </div>
              <div className="grid grid-cols-[120px_minmax(0,1fr)] py-4">
                <dt className="text-sm text-muted-foreground">{t("auth.profile.address")}</dt>
                <dd className="break-words">{address || dash}</dd>
              </div>
              {since && (
                <div className="grid grid-cols-[120px_minmax(0,1fr)] py-4">
                  <dt className="text-sm text-muted-foreground">{t("auth.profile.memberSince")}</dt>
                  <dd>{since}</dd>
                </div>
              )}
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">{t("auth.profile.deskNote")}</p>
            <Link
              to="/account/password"
              className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-accent"
            >
              {t("auth.profile.changePassword")}
            </Link>
          </>
        )}
      </div>
      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="border border-foreground p-6">
          <div className="flex items-start justify-between">
            <Logo className="h-8" />
            <span className="eyebrow">{t("auth.profile.card")}</span>
          </div>
          <div className="mt-10">
            <MemberAvatar className="h-16 w-16" textClass="text-3xl" />
          </div>
          <div className="mt-4 break-words font-display text-2xl">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.id}</div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            {since && (
              <div>
                <div className="text-xs text-muted-foreground">{t("auth.profile.memberSince")}</div>
                {since}
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground">{t("auth.profile.status")}</div>
              <MemberStatus status={member.status} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

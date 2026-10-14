import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, MemberAvatar } from "@/components/noholi";
import { MemberLoadState, MemberStatus } from "@/components/member-ui";
import { useAuth, type MemberRow } from "@/lib/auth";
import { compressPhoto, isAllowedPhoto } from "@/lib/intake";
import { removeMemberPhoto, uploadMemberPhoto } from "@/lib/member-photo";
import { useApp } from "@/lib/store";
import { describeError, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/account/profile")({
  // Older links used `?edit=true`; the page is the edit form now, so the flag is simply accepted.
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => ({
    edit:
      search["edit"] === true || search["edit"] === "true" || search["edit"] === 1
        ? true
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Edit profile — My Noholi" },
      { name: "description", content: "Review and update your Noholi patron profile." },
      { property: "og:title", content: "Edit profile — My Noholi" },
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
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // A newly chosen photo is only uploaded on Save; `removed` clears the stored one on Save.
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null);
  const [removed, setRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (pending) URL.revokeObjectURL(pending.url);
    },
    [pending],
  );

  if (!member) return <MemberLoadState loadingLabel={t("auth.profile.loading")} />;

  const d = draft ?? draftOf(member);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft({ ...d, [k]: e.target.value });
  const since = sinceDate(member["created_at"], lang);
  const dirty = draft !== null || pending !== null || removed;
  // What the avatars show now: the staged photo, the initial if removed, else the stored photo.
  const shown = pending ? pending.url : removed ? null : undefined;
  const hasPhoto = Boolean(pending || (!removed && member.avatar));

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isAllowedPhoto(file)) {
      setErr(t("auth.profile.photoBad"));
      return;
    }
    try {
      const blob = await compressPhoto(file);
      setPending({ blob, url: URL.createObjectURL(blob) });
      setRemoved(false);
      setErr("");
    } catch (error) {
      setErr(describeError(error));
    }
  };

  const reset = () => {
    setDraft(null);
    setPending(null);
    setRemoved(false);
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
    const previous = member.avatar;
    let uploaded: string | undefined;
    try {
      if (pending) uploaded = await uploadMemberPhoto(member.id, pending.blob);
      // '' clears the photo, undefined leaves it unchanged.
      const avatar = uploaded ?? (removed ? "" : undefined);
      // Name and email stay with the desk; phone, address and photo are the member's own.
      const { error } = await supabase.rpc("update_my_profile", {
        p_phone: d.phone.trim(),
        p_address_line: d.street.trim(),
        p_city: d.city.trim(),
        p_district: d.district.trim(),
        p_postal_code: d.postal.trim(),
        ...(avatar === undefined ? {} : { p_avatar: avatar }),
      });
      if (error) throw error;
      if (avatar !== undefined) await removeMemberPhoto(previous);
      await refreshMember();
      toast(t("auth.profile.saved"));
      reset();
    } catch (error) {
      if (uploaded) await removeMemberPhoto(uploaded); // don't leave an orphan upload behind
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
      <form onSubmit={save} noValidate className="min-w-0 lg:col-span-7">
        <h1 className="mb-8 text-4xl">{t("auth.profile.editTitle")}</h1>

        <div className="eyebrow mb-4">{t("auth.profile.photoLabel")}</div>
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
          <MemberAvatar className="h-28 w-28" textClass="text-5xl" src={shown} />
          <div className="min-w-0">
            <p className="text-sm">{t("auth.profile.photoHint")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("auth.profile.photoTypes")}</p>
            {pending && (
              <p className="mt-2 text-xs text-muted-foreground">{t("auth.profile.photoPending")}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={pick}
              aria-label={t("auth.profile.photoLabel")}
              tabIndex={-1}
            />
            <div className="mt-3 flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                {hasPhoto ? t("auth.profile.changePhoto") : t("auth.profile.addPhoto")}
              </Button>
              {hasPhoto && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setPending(null);
                    setRemoved(true);
                  }}
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {t("auth.profile.removePhoto")}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="pf-name">{t("auth.profile.fullName")}</Label>
            <Input id="pf-name" value={member.name} readOnly disabled className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-email">{t("auth.profile.email")}</Label>
            <Input id="pf-email" value={member.email ?? ""} readOnly disabled className="h-11" />
          </div>
          {field("phone", t("auth.profile.phone"), { auto: "tel" })}
          {field("street", t("auth.profile.address"), {
            placeholder: t("auth.profile.streetPlaceholder"),
            auto: "street-address",
          })}
          <div className="grid gap-5 sm:grid-cols-3">
            {field("city", t("auth.profile.city"), { auto: "address-level2" })}
            {field("district", t("auth.profile.district"))}
            {field("postal", t("auth.profile.postal"), { auto: "postal-code" })}
          </div>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{t("auth.profile.deskNote")}</p>
        {err && (
          <p className="mt-5 text-sm text-destructive" role="alert">
            {err}
          </p>
        )}
        <div className="mt-8 flex gap-2">
          <Button type="submit" variant="accent" disabled={busy || !dirty} aria-busy={busy}>
            {busy ? t("auth.profile.saving") : t("auth.profile.save")}
          </Button>
          <Button type="button" variant="ghost" onClick={reset} disabled={busy || !dirty}>
            {t("auth.profile.cancel")}
          </Button>
        </div>
      </form>

      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="border border-foreground p-6">
          <div className="flex items-start justify-between">
            <Logo className="h-8" />
            <span className="eyebrow">{t("auth.profile.card")}</span>
          </div>
          <div className="mt-10">
            <MemberAvatar className="h-16 w-16" textClass="text-3xl" src={shown} />
          </div>
          <div className="mt-4 break-words font-display text-2xl">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.id}</div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">{t("auth.profile.membership")}</div>
              {t("auth.profile.membershipFree")}
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t("auth.profile.status")}</div>
              <MemberStatus status={member.status} />
            </div>
            {since && (
              <div>
                <div className="text-xs text-muted-foreground">{t("auth.profile.memberSince")}</div>
                {since}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

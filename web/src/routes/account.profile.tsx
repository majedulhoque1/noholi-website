import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDate, Initials, Logo, MemberAvatar, StatusBadge } from "@/components/noholi";
import { user } from "@/lib/data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/profile")({ head: () => ({ meta: [{"title": "My profile \u2014 My Noholi"}, {"name": "description", "content": "Review and update your Noholi patron profile."}, {"property": "og:title", "content": "My profile \u2014 My Noholi"}, {"property": "og:description", "content": "Review and update your Noholi patron profile."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }), component: Profile });

type U = typeof user;
const fields: [keyof U, string][] = [["name", "Full name"], ["email", "Email"], ["phone", "Phone"], ["address", "Address"]];

function PhotoEditor({ draft, setDraft }: { draft: string | null; setDraft: (v: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const { avatar } = useApp();
  const changed = draft !== avatar;
  return (
    <fieldset className="grid gap-5 border-b border-border pb-8 sm:grid-cols-[128px_minmax(0,1fr)] sm:items-center">
      <legend className="eyebrow mb-4">Profile photo</legend>
      <button type="button" onClick={() => ref.current?.click()} className="group relative h-32 w-32 overflow-hidden rounded-full border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Choose a new profile photo">
        {draft ? <img src={draft} alt="Profile photo preview" className="h-full w-full object-cover" /> : <Initials name={user.name} className="h-full w-full text-5xl" />}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-background/85 py-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Camera className="h-3.5 w-3.5" /> Change</span>
      </button>
      <div>
        <p className="text-sm">Upload a clear profile photo. The librarian uses it to recognise you at the desk.</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP · face clearly visible</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>{draft ? "Change photo" : "Upload photo"}</Button>
          {draft && <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setDraft(null)}>Remove</Button>}
        </div>
        {changed && <p className="mt-3 text-xs font-medium text-accent">New photo selected — save to apply it everywhere.</p>}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setDraft(URL.createObjectURL(f)); e.target.value = ""; }} />
    </fieldset>
  );
}

function Profile() {
  const { avatar, setAvatar } = useApp();
  const [edit, setEdit] = useState(false);
  const [u, setU] = useState<U>(user);
  const [draftU, setDraftU] = useState<U>(user);
  const [draftPhoto, setDraftPhoto] = useState<string | null>(avatar);

  const start = () => { setDraftU(u); setDraftPhoto(avatar); setEdit(true); };
  const cancel = () => { setEdit(false); };
  const save = () => { setU(draftU); setAvatar(draftPhoto); setEdit(false); toast("Profile updated"); };

  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-7">
        {edit ? (
          <form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <h1 className="mb-8 text-4xl">Edit profile</h1>
            <PhotoEditor draft={draftPhoto} setDraft={setDraftPhoto} />
            <div className="mt-8 grid gap-5">
              {fields.map(([k, l]) => <div key={k} className="space-y-2"><Label htmlFor={k}>{l}</Label><Input id={k} value={draftU[k]} onChange={(e) => setDraftU({ ...draftU, [k]: e.target.value })} className="h-11" /></div>)}
            </div>
            <div className="mt-8 flex gap-2"><Button type="submit">Save changes</Button><Button type="button" variant="ghost" onClick={cancel}>Cancel</Button></div>
          </form>
        ) : (
          <>
            <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
              <MemberAvatar className="h-28 w-28" textClass="text-5xl" />
              <div className="min-w-0 flex-1">
                <h1 className="text-4xl leading-tight">{u.name}</h1>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{user.memberId}</div>
                <div className="mt-2"><StatusBadge status="Active" /> <span className="text-sm text-muted-foreground">· {user.plan}</span></div>
              </div>
              <Button variant="outline" onClick={start} className="self-start sm:self-center">Edit profile</Button>
            </div>
            <dl className="divide-y divide-border border-b border-border">
              {fields.slice(1).map(([k, l]) => <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] py-4"><dt className="text-sm text-muted-foreground">{l}</dt><dd>{u[k]}</dd></div>)}
              <div className="grid grid-cols-[120px_minmax(0,1fr)] py-4"><dt className="text-sm text-muted-foreground">Member since</dt><dd>{fmtDate(user.since)}</dd></div>
            </dl>
          </>
        )}
      </div>
      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="border border-foreground p-6">
          <div className="flex items-start justify-between"><Logo className="h-8" /><span className="eyebrow">Patron card</span></div>
          <div className="mt-10">{edit ? (draftPhoto ? <img src={draftPhoto} alt="" className="h-16 w-16 rounded-full object-cover" /> : <Initials name={user.name} className="h-16 w-16 text-3xl" />) : <MemberAvatar className="h-16 w-16" textClass="text-3xl" />}</div>
          <div className="mt-4 font-display text-2xl">{edit ? draftU.name : u.name}</div>
          <div className="text-sm text-muted-foreground">{user.memberId}</div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div><div className="text-xs text-muted-foreground">Membership</div>{user.plan}</div>
            <div><div className="text-xs text-muted-foreground">Status</div><span className="text-success">● Active</span></div>
            <div><div className="text-xs text-muted-foreground">Member since</div>{fmtDate(user.since)}</div>
            <div><div className="text-xs text-muted-foreground">Valid until</div>{fmtDate(user.expires)}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}

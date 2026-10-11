import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberAvatar } from "@/components/noholi";
import { user } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/settings")({ head: () => ({ meta: [{"title": "Account settings \u2014 My Noholi"}, {"name": "description", "content": "Manage your Noholi language, appearance and account preferences."}, {"property": "og:title", "content": "Account settings \u2014 My Noholi"}, {"property": "og:description", "content": "Manage your Noholi language, appearance and account preferences."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }), component: Settings });

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return <div className="grid gap-4 border-b border-border py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"><div><div className="font-medium">{title}</div>{desc && <div className="mt-1 text-sm text-muted-foreground">{desc}</div>}</div><div>{children}</div></div>;
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return <div className="inline-flex border border-border p-0.5">{options.map(([v, l]) => <button key={v} onClick={() => onChange(v)} className={cn("h-9 px-4 text-sm", value === v ? "bg-foreground text-background" : "text-muted-foreground")}>{l}</button>)}</div>;
}

function Settings() {
  const { theme, setTheme, lang, setLang, logout } = useApp();
  const nav = useNavigate();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-4xl">Account settings</h1>
      <Tabs defaultValue="general">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
          {[["general", "General"], ["account", "Account"], ["security", "Security"]].map(([v, l]) => <TabsTrigger key={v} value={v} className="-mb-px flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">{l}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="general">
          <Row title="Language" desc="Applies across the whole website."><Seg value={lang} options={[["en", "English"], ["bn", "বাংলা"]]} onChange={setLang} /></Row>
          <Row title="Theme"><Seg value={theme} options={[["light", "Light"], ["dark", "Dark"]]} onChange={setTheme} /></Row>
          {[["Due-date reminders", "Two days before a book is due back", true], ["Borrow request updates", "When a request is approved or ready for pickup", true], ["Contribution decisions", "When editors review your writing", true], ["New Noholi Books", "A short note when we publish", false]].map(([t, d, on]) => (
            <Row key={t as string} title={t as string} desc={d as string}><Switch defaultChecked={on as boolean} aria-label={t as string} /></Row>
          ))}
        </TabsContent>
        <TabsContent value="account">
          <Row title="Profile photo" desc="Shown to the librarian when you borrow."><div className="flex items-center gap-4"><MemberAvatar className="h-16 w-16" textClass="text-2xl" /><Button variant="outline" size="sm" asChild><Link to="/account/profile">Change photo</Link></Button></div></Row>
          <Row title="Full name"><Input defaultValue={user.name} className="h-11" /></Row>
          <Row title="Email address" desc="Used for reminders and request updates."><Input defaultValue={user.email} className="h-11" /></Row>
          <Row title="Phone" desc="We send pickup alerts by SMS."><Input defaultValue={user.phone} className="h-11" /></Row>
          <Row title="Address"><Input defaultValue={user.address} className="h-11" /></Row>
          <div className="mt-8"><Button onClick={() => toast("Changes saved")}>Save changes</Button></div>
        </TabsContent>
        <TabsContent value="security">
          <Row title="Change password"><div className="grid gap-3"><Label className="sr-only" htmlFor="cp">Current password</Label><Input id="cp" type="password" placeholder="Current password" className="h-11" /><Input type="password" placeholder="New password" aria-label="New password" className="h-11" /><Button variant="outline" className="w-fit" onClick={() => toast("Password updated")}>Update password</Button></div></Row>
          <Row title="Keep reading history" desc="Used for Continue Reading and listening history."><Switch defaultChecked aria-label="Reading history" /></Row>
          <Row title="Sign out" desc="Ends your session on this device."><Button variant="outline" onClick={() => { logout(); nav({ to: "/" }); }}>Log out</Button></Row>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/noholi";
import { LocationMap } from "@/components/location-map";
import { library } from "@/lib/data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Noholi Library" },
      { name: "description", content: "Visit Noholi Library at House 808, Road 11 Avenue 6, Pallabi, Dhaka 1216, or send us a message." },
      { property: "og:title", content: "Contact Noholi Library" },
      { property: "og:description", content: "Address, opening hours and a contact form for Noholi Library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageIntro eyebrow="Contact · যোগাযোগ" title="Come by, or write to us.">We answer every message within two working days. For membership questions, the front desk is quickest.</PageIntro>
      <section className="container-page grid gap-16 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-4">
          {[
            { icon: MapPin, t: "Address", d: library.address.join("\n"), href: library.mapsUrl },
            { icon: Phone, t: "Phone", d: library.phoneDisplay, href: library.phoneHref },
            { icon: Mail, t: "Email", d: "hello@noholi.org\nmembers@noholi.org", href: "mailto:hello@noholi.org" },
          ].map((x) => (
            <div key={x.t} className="grid grid-cols-[24px_minmax(0,1fr)] gap-4">
              <x.icon className="mt-1 h-5 w-5 text-accent" />
              <div><div className="eyebrow mb-2">{x.t}</div><a href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block whitespace-pre-line font-display text-xl leading-snug hover:text-accent">{x.d}</a></div>
            </div>
          ))}
          <div className="border-t border-border pt-8">
            <div className="eyebrow mb-4">Opening hours</div>
            <dl className="space-y-2 text-sm">
              {library.hours.map(([d, h]) => (
                <div key={d} className="flex justify-between border-b border-dashed border-border pb-2"><dt>{d}</dt><dd className="tabular-nums text-muted-foreground">{h}</dd></div>
              ))}
            </dl>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {sent ? (
            <div className="border border-border p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success text-background"><Check /></div>
              <h2 className="mt-6 text-3xl">Thank you — message received.</h2>
              <p className="mt-2 text-muted-foreground">We'll reply to your email within two working days.</p>
              <Button variant="outline" className="mt-8" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="n">Name</Label><Input id="n" required placeholder="Your full name" className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required placeholder="you@example.com" className="h-11" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="s">Subject</Label><Input id="s" required placeholder="Membership, donations, events…" className="h-11" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="m">Message</Label><Textarea id="m" required rows={7} placeholder="Write your message" /></div>
              <div className="sm:col-span-2"><Button size="lg" type="submit">Send message</Button></div>
            </form>
          )}
        </div>
      </section>
      <section className="container-page mt-20">
        <LocationMap className="h-[26rem] w-full" card />
      </section>
    </>
  );
}

import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/noholi";
import { LocationMap } from "@/components/location-map";
import { LangToggle, libraryLinks, ThemeToggle, writeLinks } from "@/components/site-header";
import { library } from "@/lib/data";
import { useApp } from "@/lib/store";

export function SiteFooter() {
  const { t } = useApp();
  return (
    <footer className="mt-24 border-t border-foreground bg-background">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="h-12" />
          <p className="mt-6 max-w-xs font-display text-xl leading-snug">
            A library and literary home for readers, listeners and writers in Bangladesh.
          </p>
          <div className="mt-6 flex gap-4 text-muted-foreground">
            <a href="#" aria-label="Facebook" className="hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-foreground">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
        <FooterCol
          title="Noholi"
          links={[
            { to: "/", l: t("home") },
            { to: "/about", l: t("about") },
            { to: "/contact", l: t("contact") },
            { to: "/join", l: t("become") },
          ]}
        />
        <FooterCol
          title={t("library")}
          links={libraryLinks.map((x) => ({ to: x.to, l: t(x.k) }))}
        />
        <FooterCol title={t("writeups")} links={writeLinks.map((x) => ({ to: x.to, l: t(x.k) }))} />
        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Visit</div>
          <address className="text-sm not-italic leading-relaxed text-muted-foreground">
            <a
              href={library.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {library.address.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
            </a>
            <span className="tabular-nums">{library.hoursShort}</span>
            <br />
            <a href="mailto:hello@noholi.org" className="text-foreground hover:text-accent">
              hello@noholi.org
            </a>
          </address>
        </div>
      </div>
      <div className="container-page pb-14">
        <LocationMap className="h-72 w-full" card="sm" />
      </div>
      <div className="container-page flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Noholi Library. Prototype — all data is for demonstration.</span>
        <div className="flex items-center gap-3">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; l: string }[] }) {
  return (
    <div className="md:col-span-2">
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {links.map((x) => (
          <li key={x.to}>
            <Link to={x.to} className="hover:text-accent">
              {x.l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/noholi";
import { LocationMap } from "@/components/location-map";
import { LangToggle, libraryLinks, ThemeToggle, writeLinks } from "@/components/site-header";
import { library } from "@/lib/data";
import { useApp } from "@/lib/store";

// Noholi OS (staff console). Override with VITE_ADMIN_URL when it moves to a custom domain.
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "https://noholi-admin1.vercel.app";

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
        </div>
        <FooterCol
          title="Noholi"
          links={[
            { to: "/", l: t("home") },
            { to: "/about", l: t("about") },
            { to: "/contact", l: t("contact") },
            { to: "/join", l: t("become") },
            { to: "/privacy", l: t("forms.footer.privacy") },
          ]}
        />
        <FooterCol
          title={t("library")}
          links={libraryLinks.map((x) => ({ to: x.to, l: t(x.k) }))}
        />
        <FooterCol title={t("writeups")} links={writeLinks.map((x) => ({ to: x.to, l: t(x.k) }))} />
        <div className="md:col-span-2">
          <div className="eyebrow mb-4">{t("forms.footer.visit")}</div>
          {library.confirmed ? (
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
              <a href={`mailto:${library.email}`} className="text-foreground hover:text-accent">
                {library.email}
              </a>
            </address>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("forms.footer.visitSoon")}
            </p>
          )}
        </div>
      </div>
      {library.confirmed && (
        <div className="container-page pb-14">
          <LocationMap className="h-72 w-full" card="sm" />
        </div>
      )}
      <div className="container-page flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{t("forms.footer.copyright")}</span>
        <div className="flex items-center gap-3">
          <a
            href={ADMIN_URL}
            rel="nofollow"
            className="rounded-full border border-foreground px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background"
          >
            {t("forms.footer.staff")}
          </a>
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

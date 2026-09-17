import Link from "next/link";
import { footerLinks, siteConfig } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface">
      <div className="container-max grid gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-10 lg:py-20">
        <div>
          <Link href="#acasa" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-[image:var(--gradient-blue-purple)] font-display text-sm font-bold text-white">
              P
            </span>
            <span className="font-display text-xl font-semibold text-foreground">{siteConfig.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
          <a
            href={siteConfig.robixHostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-accent-2 hover:text-accent-2"
          >
            Partener RobixHost.ro
          </a>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Servicii</h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.services.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Navigare</h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.nav.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`mailto:${siteConfig.email}`} className="text-muted-foreground transition-colors hover:text-foreground">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
                Trimite o solicitare
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-max flex flex-col gap-3 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span>
          © {new Date().getFullYear()} {siteConfig.legalName}. Toate drepturile rezervate.
        </span>
        <div className="flex gap-6">
          {footerLinks.legal.map((link) => (
            <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

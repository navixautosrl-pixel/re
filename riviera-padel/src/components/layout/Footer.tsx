import Link from "next/link";
import { activities, navLinks, siteConfig } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-max grid gap-12 px-5 py-16 sm:px-8 lg:grid-cols-4 lg:px-10 lg:py-20">
        <div className="lg:col-span-2">
          <span className="font-display block text-4xl uppercase leading-none text-foreground">
            {siteConfig.name}
          </span>
          <span className="font-mono mt-2 block text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Padel Lounge &amp; Sports
          </span>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {activities.map((activity, i) => (
              <span key={activity} className="flex items-center gap-5">
                {activity}
                {i < activities.length - 1 ? <span className="text-accent">·</span> : null}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Navigare</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-foreground/80 transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-foreground/80">
            <span>{siteConfig.addressLine1}</span>
            <span>{siteConfig.city}</span>
            <a href={siteConfig.phoneHref} className="transition-colors hover:text-accent">
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-max flex flex-col gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>
            © {new Date().getFullYear()} {siteConfig.fullName}.
          </span>
          <span>Strada Mehadia 41, {siteConfig.city}</span>
        </div>
      </div>
    </footer>
  );
}

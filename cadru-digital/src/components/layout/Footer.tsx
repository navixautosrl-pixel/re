import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { navLinks, siteConfig, services } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-max px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="font-display text-xl text-foreground">{siteConfig.name}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {siteConfig.email}
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Servicii</p>
            <ul className="mt-4 space-y-2.5">
              {services.slice(0, 5).map((s) => (
                <li key={s.name}>
                  <a href="#servicii" className="text-sm text-foreground/80 transition-colors hover:text-accent">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Navigație</p>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-accent">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Partener găzduire</p>
            <a
              href={siteConfig.robixHostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-accent"
            >
              RobixHost
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
              Găzduire recomandată și configurată de noi pentru proiectele pe care le construim.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.legalName}. Toate drepturile rezervate.</p>
          <div className="flex gap-5">
            <Link href="/confidentialitate" className="hover:text-foreground">
              Confidențialitate
            </Link>
            <Link href="/termeni" className="hover:text-foreground">
              Termeni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

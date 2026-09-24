"use client";

import Link from "next/link";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { CookieSettingsButton } from "@/components/shared/CookieConsent";
import { Logo } from "@/components/shared/Logo";
import { paymentMarks } from "@/components/shared/PaymentMarks";
import { footerLinks, paymentMethods, siteConfig } from "@/lib/constants";
import { useSectionHref } from "@/lib/useSectionHref";

/*
 * Cele două butoane ANPC sunt o obligație legală pentru orice comerciant
 * online din România (SAL — soluționare alternativă a litigiilor, și SOL —
 * platforma europeană de soluționare online). Le desenăm noi, cu text, în
 * loc să legăm imaginile oficiale de pe anpc.ro: o imagine găzduită la ei
 * se poate muta oricând, iar atunci în subsol rămâne un pătrat rupt exact
 * acolo unde legea cere o trimitere funcțională.
 */
const anpcLinks = [
  {
    label: "ANPC — SAL",
    title: "Soluționarea alternativă a litigiilor",
    href: "https://anpc.ro/ce-este-sal/",
  },
  {
    label: "ANPC — SOL",
    title: "Soluționarea online a litigiilor",
    href: "https://ec.europa.eu/consumers/odr",
  },
];

export function Footer() {
  const sectionHref = useSectionHref();
  const whatsapp = `https://wa.me/${siteConfig.phoneHref.replace("+", "")}`;

  return (
    <footer className="relative border-t border-border bg-surface">
      <div className="container-max grid gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-10 lg:py-20">
        <div>
          <Link
            href={sectionHref("#acasa")}
            className="-my-1 inline-flex items-center py-1"
            aria-label={`${siteConfig.name} — pagina principală`}
          >
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
          <a
            href={siteConfig.robixHostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-accent-2 hover:text-accent-2"
          >
            Partener RobixHost.ro
          </a>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">Servicii</h2>
          <ul className="mt-2 space-y-1">
            {footerLinks.services.map((link) => (
              <li key={link.label}>
                <Link
                  href={sectionHref(link.href)}
                  className="block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">Navigare</h2>
          <ul className="mt-2 space-y-1">
            {footerLinks.nav.map((link) => (
              <li key={link.label}>
                <Link
                  href={sectionHref(link.href)}
                  className="block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">Contact</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <a
                href={`tel:${siteConfig.phoneHref}`}
                className="flex items-center gap-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-4 shrink-0 text-accent-2" aria-hidden="true" />
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="size-4 shrink-0 text-accent-2" aria-hidden="true" />
                <span className="break-all">{siteConfig.email}</span>
              </a>
            </li>
            <li>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="size-4 shrink-0 text-accent-2" aria-hidden="true" />
                Scrie pe WhatsApp
              </a>
            </li>
          </ul>

        </div>
      </div>

      {/* Banda de încredere: metodele de plată și trimiterile ANPC. Stau
          pe un rând propriu, nu într-o coloană de meniu — o coloană le-ar
          fi rupt pe două rânduri și le-ar fi ascuns exact de cine le caută. */}
      <div className="container-max flex flex-col gap-6 border-t border-border px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">Metode de plată</h2>
          <ul className="mt-3 flex flex-wrap items-center gap-2.5">
            {paymentMethods.map((method) => {
              const Mark = paymentMarks[method.id];
              return (
                <li
                  key={method.id}
                  title={method.label}
                  className="flex h-9 w-14 items-center justify-center rounded-md border border-border bg-background px-1.5 text-muted-foreground"
                >
                  <Mark className="h-5 w-full" />
                </li>
              );
            })}
          </ul>
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            Nu acceptăm plata în numerar sau ramburs.
          </p>
        </div>

        <div className="lg:max-w-md lg:text-right">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ai o reclamație? Scrie-ne întâi nouă — dacă nu găsim o soluție, te poți adresa ANPC:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2.5 lg:justify-end">
            {anpcLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  title={link.title}
                  className="inline-flex flex-col rounded-md border border-border bg-background px-3.5 py-2 text-left transition-colors hover:border-accent-2"
                >
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-accent-2">
                    {link.label}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-max flex flex-col gap-3 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span>
          © {new Date().getFullYear()} {siteConfig.legalName}. Toate drepturile rezervate.
        </span>
        <div className="-my-1.5 flex flex-wrap gap-x-6 gap-y-1">
          {footerLinks.legal.map((link) => (
            <Link
              key={link.label}
              href={sectionHref(link.href)}
              className="block py-1.5 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <CookieSettingsButton className="block py-1.5 transition-colors hover:text-foreground">
            Preferințe cookie-uri
          </CookieSettingsButton>
        </div>
      </div>
    </footer>
  );
}

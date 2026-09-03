import Link from "next/link";
import Image from "next/image";
import { footerLinks, siteConfig, paymentMethods } from "@/lib/constants";
import { CookiePreferencesTrigger } from "@/components/cookies/CookiePreferencesTrigger";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/brand/logo.webp" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
              <span className="text-[15px] font-semibold">{siteConfig.name}</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <p className="mt-5 font-mono-tech text-xs text-muted-foreground">{siteConfig.supportEmail}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <FooterColumn title="Produse" links={footerLinks.products} />
            <FooterColumn title="Soluții" links={footerLinks.solutions} />
            <FooterColumn title="Companie" links={footerLinks.company} />
            <div>
              <h3 className="text-xs uppercase tracking-[0.06em] text-muted-foreground">Legal</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookiePreferencesTrigger className="text-sm text-muted-foreground transition-colors hover:text-foreground" />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-muted-foreground">Plată securizată:</span>
            {paymentMethods.map((m) => (
              <span key={m.name} className="rounded-xs border border-border px-2 py-1 text-xs text-muted-foreground">
                {m.name}
              </span>
            ))}
          </div>
          <a
            href={siteConfig.clientAreaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
          >
            Cont client — clienti.robixhost.ro
          </a>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.name}. Toate drepturile rezervate.</p>
          <p>
            Date companie (CUI, Reg. Com., sediu):{" "}
            <span className="text-muted-foreground/70">de completat</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.06em] text-muted-foreground">{title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

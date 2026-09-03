import Link from "next/link";
import Image from "next/image";
import { footerLinks, siteConfig, paymentMethods } from "@/lib/constants";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { CookiePreferencesTrigger } from "@/components/cookies/CookiePreferencesTrigger";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/brand/logo.webp" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="font-display text-base font-bold">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <p className="mt-4 font-data text-xs text-muted-foreground">
              {siteConfig.supportEmail}
            </p>
          </div>

          <FooterColumn title="Produse" links={footerLinks.products} />
          <FooterColumn title="Companie" links={footerLinks.company} />
          <div>
            <h3 className="text-sm font-medium text-foreground">Legal</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesTrigger />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            Metode de plată
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {paymentMethods.map((m) => (
              <span
                key={m.name}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground"
              >
                {m.name}
              </span>
            ))}
            <ConfigBadge>Payment integration ready</ConfigBadge>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Toate drepturile rezervate.
          </p>
          <p>
            Date companie (CUI, Reg. Com., sediu):{" "}
            <ConfigBadge>de completat</ConfigBadge>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

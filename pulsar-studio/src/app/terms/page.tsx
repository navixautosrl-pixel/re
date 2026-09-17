import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="container-max section-y px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">Legal</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-foreground">Termeni și condiții</h1>

        <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Acest text este un <strong className="text-foreground">placeholder</strong> — {siteConfig.name} este un
            proiect demonstrativ și nu a publicat încă termeni și condiții reali, revizuiți juridic.
          </p>
          <p className="mt-4">
            Pentru un proiect live, această pagină trebuie să acopere condițiile de livrare a serviciilor descrise în
            pachete, politica de plată și rambursare, drepturile de proprietate intelectuală asupra codului livrat și
            limitele de răspundere — redactate sau revizuite de un specialist juridic, nu generate automat.
          </p>
        </div>

        <Link href="/" className="mt-8 inline-block text-sm font-medium text-foreground hover:text-accent-2">
          ← Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}

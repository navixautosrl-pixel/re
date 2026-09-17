import type { Metadata } from "next";
import { ogImages } from "@/lib/basePath";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Cum tratăm datele trimise prin formularul de contact Pulsar Studio.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Politica de confidențialitate — Pulsar Studio", description: "Cum tratăm datele trimise prin formularul de contact Pulsar Studio.", url: "/privacy" , images: ogImages },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="container-max section-y px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">Legal</p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-foreground">Politica de confidențialitate</h1>

        <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Acest text este un <strong className="text-foreground">placeholder</strong> — {siteConfig.name} este un
            proiect demonstrativ și nu a publicat încă o politică de confidențialitate reală, revizuită juridic.
          </p>
          <p className="mt-4">
            Pentru un proiect live, această pagină trebuie să descrie exact ce date se colectează prin formularul de
            contact, cum sunt stocate și procesate, ce servicii terțe (hosting, analytics) sunt implicate, și cum poate
            un vizitator solicita ștergerea datelor — redactată sau revizuită de un specialist juridic, nu generată
            automat.
          </p>
        </div>

        <Link href="/" className="mt-8 inline-block py-2 text-sm font-medium text-foreground hover:text-accent-2">
          ← Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}

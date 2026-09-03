import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Ticket, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactează echipa RobixHost pentru întrebări comerciale sau tehnice.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Vorbește cu echipa RobixHost"
        description="Ai deja un cont? Cel mai rapid răspuns vine printr-un tichet de suport, cu istoric complet al serviciilor tale."
      />

      <section className="section-y">
        <div className="mx-auto grid max-w-4xl gap-4 px-6 sm:grid-cols-2 lg:px-10">
          <Reveal>
            <a
              href={siteConfig.clientAreaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-lg border border-border-strong bg-surface p-7 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-start justify-between">
                <Ticket className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-medium">Deschide un tichet</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Prin contul de client (clienti.robixhost.ro) — pentru suport tehnic, facturare sau
                întrebări despre comenzi existente.
              </p>
            </a>
          </Reveal>

          <Reveal delay={0.08}>
            <a
              href={`mailto:${siteConfig.salesEmail}`}
              className="group flex h-full flex-col rounded-lg border border-border p-7 transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between">
                <Mail className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-medium">Întrebări comerciale</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{siteConfig.salesEmail}</p>
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mx-auto mt-10 max-w-4xl px-6 lg:px-10">
          <div className="flex items-center justify-between rounded-md border border-border px-5 py-4">
            <span className="text-sm text-muted-foreground">Program suport</span>
            <ConfigBadge>De confirmat</ConfigBadge>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mx-auto mt-4 max-w-4xl px-6 text-center lg:px-10">
          <p className="text-sm text-muted-foreground">
            Întrebare frecventă? Verifică mai întâi{" "}
            <Link href="/faq" className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
              pagina de FAQ
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </>
  );
}

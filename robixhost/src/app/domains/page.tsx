import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { domainPricing, orderUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Domenii — Înregistrare și Administrare",
  description: "Prețuri domenii .ro, .com, .eu, .net — înregistrare și administrare DNS din contul RobixHost.",
};

export default function DomainsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Domenii"
        title="Domeniul tău, administrat dintr-un singur loc"
        description="Înregistrare și administrare DNS pentru domeniul afacerii tale, prin contul de client RobixHost."
      />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-2xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading title="Prețuri domenii" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-lg border border-border">
            {domainPricing.map((d) => (
              <div key={d.tld} className="flex items-center justify-between border-t border-border px-6 py-4 first:border-t-0">
                <span className="font-mono-tech text-sm">{d.tld}</span>
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{d.priceRon} RON</span> {d.note}
                </span>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.15} className="mt-8 flex justify-center">
            <MagneticButton>
              <Button asChild size="lg" variant="primary">
                <a href={orderUrl} target="_blank" rel="noopener noreferrer">
                  Caută un domeniu
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading title="Administrare DNS" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3">
            {[
              "Administrare DNS centralizată din cont",
              "Reînnoire gestionată din contul de client",
              "Redirecționare și subdomenii",
            ].map((f) => (
              <div key={f} className="bg-background p-6 text-sm text-foreground/90">
                {f}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

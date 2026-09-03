import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { DomainSearch } from "@/components/sections/DomainSearch";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Domenii — Înregistrare și Administrare",
  description: "Caută și înregistrează un domeniu, cu administrare DNS centralizată din contul RobixHost.",
};

const dnsFeatures = [
  "Administrare DNS centralizată din cont",
  "Reînnoire gestionată automat — CONFIG HERE",
  "Redirecționare și subdomenii",
];

export default function DomainsPage() {
  return (
    <>
      <PageHeader
        eyebrow="DOMENII"
        title="Domeniul tău, administrat dintr-un singur loc"
        description="Înregistrare și administrare DNS pentru domeniul afacerii tale."
      />

      <DomainSearch />

      <section className="border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title="Administrare DNS" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-3">
            {dnsFeatures.map((f) => (
              <div
                key={f}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4 text-sm text-foreground/90"
              >
                {f}
                {f.includes("CONFIG HERE") ? <ConfigBadge>TODO</ConfigBadge> : null}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { vpsPlans, productCategories } from "@/lib/constants";

export const metadata: Metadata = {
  title: "VPS Romania — Servere Virtuale Private",
  description: "VPS cu resurse dedicate, acces root complet și scalare fără migrare de date. Planuri de la 59 RON/lună.",
};

export default function VpsPage() {
  const product = productCategories.find((p) => p.slug === "vps")!;

  return (
    <>
      <PageHeader eyebrow="VPS" title="Servere virtuale, resurse dedicate" description={product.description} />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading title="De ce VPS RobixHost" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3">
            {product.benefits.map((b) => (
              <div key={b} className="bg-background p-6 text-sm text-foreground/90">
                {b}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Prețuri" title="Planuri VPS" align="center" />
          </Reveal>
          <div className="mt-12">
            <PlansGrid plans={vpsPlans} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

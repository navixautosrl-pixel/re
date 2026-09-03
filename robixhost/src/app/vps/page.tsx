import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { vpsPlans, productCategories } from "@/lib/constants";

export const metadata: Metadata = {
  title: "VPS Romania — Servere Virtuale Private",
  description:
    "VPS cu resurse dedicate, acces root complet și scalare fără migrare de date. Planuri Starter, Pro și Business.",
};

export default function VpsPage() {
  const product = productCategories.find((p) => p.slug === "vps")!;

  return (
    <>
      <PageHeader eyebrow="VPS" title="Servere virtuale, resurse dedicate" description={product.description} />

      <section className="border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title="De ce VPS RobixHost" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-8 grid gap-4 sm:grid-cols-3">
            {product.benefits.map((b) => (
              <div key={b} className="rounded-lg border border-border bg-surface p-5 text-sm text-foreground/90">
                {b}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="PLANURI" title="Planuri VPS" align="center" />
          </Reveal>
          <div className="mt-10">
            <PlansGrid plans={vpsPlans} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

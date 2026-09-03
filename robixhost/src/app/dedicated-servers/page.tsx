import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { dedicatedServerPlans, productCategories } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dedicated Servers Romania",
  description: "Servere fizice dedicate, resurse hardware exclusive și control complet la nivel de sistem. De la 449 RON/lună.",
};

export default function DedicatedServersPage() {
  const product = productCategories.find((p) => p.slug === "dedicated-servers")!;

  return (
    <>
      <PageHeader eyebrow="Dedicated Servers" title="Hardware dedicat, control complet" description={product.description} />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading title="Pentru cine sunt serverele dedicate" align="center" />
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
            <SectionHeading eyebrow="Prețuri" title="Planuri Dedicated Servers" align="center" />
          </Reveal>
          <div className="mt-12">
            <PlansGrid plans={dedicatedServerPlans} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

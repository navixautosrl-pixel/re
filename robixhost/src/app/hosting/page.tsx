import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { hostingPlans, productCategories } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Web Hosting Romania",
  description: "Web hosting pe infrastructură NVMe, cu protecție DDoS inclusă. Planuri Starter, Pro și Business, de la 24 RON/lună.",
};

export default function HostingPage() {
  const product = productCategories.find((p) => p.slug === "hosting")!;

  return (
    <>
      <PageHeader eyebrow="Web Hosting" title="Găzduire web rapidă, sigură, gata de scalat" description={product.description} />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading title="Ce include hostingul RobixHost" align="center" />
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
            <SectionHeading eyebrow="Prețuri" title="Planuri Web Hosting" align="center" />
          </Reveal>
          <div className="mt-12">
            <PlansGrid plans={hostingPlans} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

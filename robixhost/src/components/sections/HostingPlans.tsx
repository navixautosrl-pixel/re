import { SectionHeading } from "@/components/shared/SectionHeading";
import { PricingCard } from "@/components/shared/PricingCard";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { hostingPlans } from "@/lib/constants";

export function HostingPlans() {
  return (
    <section className="border-b border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="PREȚURI"
              title="Planuri de Web Hosting"
              description="Structura planurilor e finală — prețurile și specificațiile exacte urmează să fie confirmate."
            />
            <ConfigBadge>Prețuri și specificații: CONFIG HERE</ConfigBadge>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {hostingPlans.map((plan, i) => (
            <Reveal key={plan.tier} delay={i * 0.08}>
              <PricingCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

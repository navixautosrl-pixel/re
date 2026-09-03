import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PricingCard } from "@/components/shared/PricingCard";
import { Reveal } from "@/components/shared/Reveal";
import { hostingPlans } from "@/lib/constants";

export function HostingPlans() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index="07" eyebrow="Prețuri" title="Web Hosting, de la 24 RON/lună" />
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 text-sm text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
          >
            Toate planurile (VPS, dedicat, game servers)
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {hostingPlans.map((plan, i) => (
            <Reveal key={plan.tier} delay={i * 0.08}>
              <PricingCard plan={plan} billingPeriod="monthly" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

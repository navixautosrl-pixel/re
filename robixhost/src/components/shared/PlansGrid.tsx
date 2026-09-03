import { PricingCard } from "./PricingCard";
import { Reveal } from "./Reveal";
import type { HostingPlan } from "@/lib/constants";

export function PlansGrid({ plans }: { plans: HostingPlan[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan, i) => (
        <Reveal key={plan.tier} delay={i * 0.08}>
          <PricingCard plan={plan} />
        </Reveal>
      ))}
    </div>
  );
}

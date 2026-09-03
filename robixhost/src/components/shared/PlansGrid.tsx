"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";
import { Reveal } from "./Reveal";
import { BillingToggle, type BillingPeriod } from "./BillingToggle";
import type { HostingPlan } from "@/lib/constants";

export function PlansGrid({ plans }: { plans: HostingPlan[] }) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <BillingToggle value={billingPeriod} onChange={setBillingPeriod} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal key={plan.tier} delay={i * 0.06}>
            <PricingCard plan={plan} billingPeriod={billingPeriod} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

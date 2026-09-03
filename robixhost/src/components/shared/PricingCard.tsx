import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedPrice } from "./AnimatedPrice";
import { cn } from "@/lib/utils";
import { annualMonthlyEquivalent, orderUrl, type HostingPlan } from "@/lib/constants";
import type { BillingPeriod } from "./BillingToggle";

export function PricingCard({
  plan,
  billingPeriod,
}: {
  plan: HostingPlan;
  billingPeriod: BillingPeriod;
}) {
  const price =
    billingPeriod === "annual" ? annualMonthlyEquivalent(plan.monthlyRon) : plan.monthlyRon;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border p-7",
        plan.featured ? "border-foreground/25 bg-surface" : "border-border"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{plan.name}</h3>
        {plan.featured ? (
          <span className="rounded-xs bg-accent-soft px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-[0.06em] text-accent">
            Recomandat
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <AnimatedPrice
          value={String(price)}
          className="text-4xl font-semibold tracking-[-0.02em] tabular-nums"
        />
        <span className="text-sm text-muted-foreground">RON / lună</span>
      </div>
      <p className="mt-1 font-mono-tech text-xs text-muted-foreground">
        {billingPeriod === "annual" ? "facturat anual" : "facturat lunar"}
      </p>

      <Button
        asChild
        variant={plan.featured ? "primary" : "outline"}
        className="mt-7 w-full"
      >
        <a href={orderUrl} target="_blank" rel="noopener noreferrer">
          Comandă {plan.name}
        </a>
      </Button>

      <ul className="mt-7 flex flex-col gap-3 border-t border-border pt-7 text-sm">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-start justify-between gap-3">
            <span className="flex shrink-0 items-start gap-2 text-foreground/90">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" strokeWidth={1.75} />
              {f.label}
            </span>
            <span className="text-right text-muted-foreground">{f.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

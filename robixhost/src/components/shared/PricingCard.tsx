import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfigBadge } from "./ConfigBadge";
import { cn } from "@/lib/utils";
import type { HostingPlan } from "@/lib/constants";

export function PricingCard({ plan }: { plan: HostingPlan }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border p-6",
        plan.featured
          ? "border-primary bg-surface-elevated shadow-[0_0_0_1px_var(--color-primary),0_0_40px_-12px_var(--color-primary)]"
          : "border-border bg-surface"
      )}
    >
      {plan.featured ? (
        <span className="mb-4 w-fit rounded-full bg-primary px-3 py-1 font-data text-[11px] font-medium text-primary-foreground">
          RECOMANDAT
        </span>
      ) : (
        <div className="mb-4 h-[26px]" aria-hidden="true" />
      )}
      <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold">{plan.price}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{plan.billingNote}</p>

      <Button
        className={cn(
          "mt-6 w-full",
          plan.featured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-surface-elevated text-foreground border border-border hover:border-primary/60"
        )}
      >
        Comandă {plan.name}
      </Button>

      <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6 text-sm">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-foreground/90">
              <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              {f.label}
            </span>
            <ConfigBadge>{f.value}</ConfigBadge>
          </li>
        ))}
      </ul>
    </div>
  );
}

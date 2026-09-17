import { Check } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { cn } from "@/lib/utils";
import { pricingDisclaimer, pricingPlans } from "@/lib/constants";

export function Pricing() {
  return (
    <section id="pachete" className="section-y relative overflow-hidden">
      <div className="glow-spot left-1/2 top-0 size-[560px] -translate-x-1/2 bg-accent-3 opacity-20" aria-hidden="true" />

      <div className="container-max relative px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Pachete simple. <span className="gradient-text">Prețuri transparente.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08} className={plan.featured ? "lg:-translate-y-3" : ""}>
              <div
                className={cn(
                  "glow-border relative flex h-full flex-col rounded-lg p-7",
                  plan.featured ? "glass border-2 border-accent-3/60 shadow-[0_20px_60px_-16px_color-mix(in_srgb,var(--color-accent-3)_55%,transparent)]" : "glass"
                )}
                style={plan.featured ? undefined : ({ ["--glow" as string]: "var(--color-accent-2)" } as React.CSSProperties)}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[image:var(--gradient-blue-purple)] px-3.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white">
                    Recomandat
                  </span>
                ) : null}

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  {plan.priceNote ? <span className="text-sm text-muted-foreground">{plan.priceNote}</span> : null}
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.audience}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-2" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button href="#contact" variant={plan.featured ? "primary" : "outline"} icon={false} className="mt-7 w-full">
                  {plan.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
          <p>{pricingDisclaimer}</p>
        </Reveal>

        <ComparisonTable />
      </div>
    </section>
  );
}

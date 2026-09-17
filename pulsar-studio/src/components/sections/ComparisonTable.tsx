"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { comparisonRows, pricingPlans } from "@/lib/constants";

function Cell({ value }: { value: string | boolean }) {
  const prefersReducedMotion = useReducedMotion();

  if (typeof value === "boolean") {
    return value ? (
      <motion.span
        initial={{ scale: prefersReducedMotion ? 1 : 0, opacity: prefersReducedMotion ? 1 : 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex size-6 items-center justify-center rounded-full bg-accent-2/15"
      >
        <Check className="size-3.5 text-accent-2" aria-hidden="true" />
      </motion.span>
    ) : (
      <Minus className="mx-auto size-4 text-muted-foreground/40" aria-hidden="true" />
    );
  }

  return <span className="text-sm text-foreground/85">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="mt-20">
      <Reveal className="mx-auto max-w-xl text-center">
        <h3 className="font-display text-2xl font-semibold text-foreground">Compară pachetele</h3>
      </Reveal>

      <Reveal delay={0.1} className="glass mt-8 overflow-x-auto rounded-lg">
        <table className="w-full min-w-[720px] border-collapse text-center">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="sticky left-0 z-10 bg-surface-elevated/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Funcționalitate
              </th>
              {pricingPlans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-foreground"
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white/[0.015]" : undefined}>
                <th scope="row" className="sticky left-0 z-10 bg-surface-elevated/80 px-5 py-3.5 text-left text-sm font-medium text-foreground/85">
                  {row.label}
                </th>
                {row.values.map((value, j) => (
                  <td key={j} className="px-5 py-3.5">
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </div>
  );
}

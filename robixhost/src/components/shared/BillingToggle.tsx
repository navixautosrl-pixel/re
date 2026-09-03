"use client";

import { cn } from "@/lib/utils";

export type BillingPeriod = "monthly" | "annual";

export function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (v: BillingPeriod) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Ciclu de facturare"
      className="inline-flex items-center rounded-md border border-border p-1"
    >
      {(["monthly", "annual"] as const).map((period) => (
        <button
          key={period}
          type="button"
          role="radio"
          aria-checked={value === period}
          onClick={() => onChange(period)}
          className={cn(
            "relative rounded-sm px-4 py-2 text-sm font-medium transition-colors",
            value === period
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {period === "monthly" ? "Lunar" : "Anual"}
          {period === "annual" ? (
            <span
              className={cn(
                "ml-2 rounded-xs px-1.5 py-0.5 font-mono-tech text-[10px]",
                value === period
                  ? "bg-background/15 text-background"
                  : "bg-accent-soft text-accent"
              )}
            >
              −15%
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

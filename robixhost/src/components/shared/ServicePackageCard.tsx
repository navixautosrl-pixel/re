import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orderUrl, type ServicePackage } from "@/lib/constants";

export function ServicePackageCard({ pkg }: { pkg: ServicePackage }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border p-7",
        pkg.featured ? "border-foreground/25 bg-surface" : "border-border"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{pkg.name}</h3>
        {pkg.featured ? (
          <span className="rounded-xs bg-accent-soft px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-[0.06em] text-accent">
            Recomandat
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-[-0.02em] tabular-nums">
          {pkg.priceRon.toLocaleString("ro-RO")}
        </span>
        <span className="text-sm text-muted-foreground">
          RON {pkg.priceUnit === "monthly" ? "/ lună" : "de la"}
        </span>
      </div>

      <Button asChild variant={pkg.featured ? "primary" : "outline"} className="mt-7 w-full">
        <a href={orderUrl} target="_blank" rel="noopener noreferrer">
          Solicită {pkg.name}
        </a>
      </Button>

      <ul className="mt-7 flex flex-col gap-3 border-t border-border pt-7 text-sm">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground/90">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" strokeWidth={1.75} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

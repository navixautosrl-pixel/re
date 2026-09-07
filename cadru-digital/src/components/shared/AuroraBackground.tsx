import { cn } from "@/lib/utils";

/**
 * Full-bleed animated color-mesh backdrop — pure CSS (transform-only
 * keyframes, GPU-cheap), no client JS needed. Pairs with the grain
 * overlay so the vivid gradient reads as atmosphere, not a flat wash.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className="aurora-field" />
      <div className="noise-overlay" />
    </div>
  );
}

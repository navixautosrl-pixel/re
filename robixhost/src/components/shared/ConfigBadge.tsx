import { cn } from "@/lib/utils";

/**
 * Marks content that is NOT real/confirmed data — a price, a spec, a
 * location, a claim the business hasn't provided yet. Never remove this
 * to make a section "look finished"; replace the underlying value in
 * lib/constants.ts once the real data exists, and this badge disappears
 * on its own (see usage sites).
 */
export function ConfigBadge({
  children = "CONFIG HERE",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-dashed border-warning/50 bg-warning/10 px-2 py-0.5 font-data text-[11px] tracking-wide text-warning",
        className
      )}
    >
      {children}
    </span>
  );
}

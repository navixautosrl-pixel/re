import { cn } from "@/lib/utils";

/**
 * Marks content that is NOT a confirmed fact — a claim this site can't
 * responsibly make yet (uptime history, datacenter address, a hardware
 * brand, a certification). Deliberately quiet — a hairline tag, not a
 * loud warning box — because it should read as "pending", not as an
 * error. Never remove this to make a section look finished; update the
 * underlying data in lib/constants.ts once the real fact exists.
 */
export function ConfigBadge({
  children = "De confirmat",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border border-border-strong px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-[0.06em] text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

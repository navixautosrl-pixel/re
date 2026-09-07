import { cn } from "@/lib/utils";

/**
 * A looping signage strip — cheap, high-impact motion that reads as
 * confident rather than decorative. Paused entirely under reduced-motion
 * via the global media query in globals.css.
 */
export function MarqueeStrip({ items, className }: { items: string[]; className?: string }) {
  const content = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-6 px-6">
          <span className="font-display text-lg text-foreground/80">{item}</span>
          <span className="text-accent" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div className={cn("overflow-hidden border-y border-border bg-surface py-4", className)}>
      <div className="marquee-track">
        <div className="flex shrink-0">{content}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {content}
        </div>
      </div>
    </div>
  );
}

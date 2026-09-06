import { cn } from "@/lib/utils";

/**
 * Looping signage strip — the urban-signage equivalent of the previous
 * site's numbered section labels. Duplicated content + CSS animation,
 * paused entirely under reduced-motion via the global media query.
 */
export function MarqueeStrip({ items, className }: { items: string[]; className?: string }) {
  const content = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-6 px-6">
          <span className="font-display-caps text-sm tracking-[0.03em]">{item}</span>
          <span className="text-accent" aria-hidden="true">
            ●
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div className={cn("overflow-hidden border-y border-border bg-surface py-3", className)}>
      <div className="marquee-track">
        <div className="flex shrink-0">{content}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {content}
        </div>
      </div>
    </div>
  );
}

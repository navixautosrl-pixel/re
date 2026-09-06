"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

/**
 * Drag-to-reveal before/after comparison — the one interactive convention
 * that's actually native to detailing (not borrowed from an unrelated
 * template). A real <input type="range"> drives it so it's keyboard and
 * screen-reader operable, not just a mouse-drag gimmick.
 */
export function BeforeAfterSlider({
  beforeLabel = "ÎNAINTE",
  afterLabel = "DUPĂ",
}: {
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [value, setValue] = useState(50);

  return (
    <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-lg border border-border sm:aspect-[16/10]">
      <div className="photo-slot absolute inset-0" data-label={beforeLabel}>
        <span className="absolute left-3 top-3 rounded-xs border border-border-strong bg-background/70 px-2 py-1 font-display-caps text-xs tracking-[0.05em] text-muted-foreground">
          {beforeLabel}
        </span>
      </div>

      <div
        className="photo-slot absolute inset-0 brightness-125 saturate-150"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
      >
        <span className="absolute right-3 top-3 rounded-xs border border-accent/50 bg-background/70 px-2 py-1 font-display-caps text-xs tracking-[0.05em] text-accent">
          {afterLabel}
        </span>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-[2px] bg-accent"
        style={{ left: `${value}%` }}
      >
        <div className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
          <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Compară înainte și după"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

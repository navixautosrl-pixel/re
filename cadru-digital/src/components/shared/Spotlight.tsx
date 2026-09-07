"use client";

import type { ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a card/row with a cursor-follow radial highlight (CSS-driven via
 * --spot-x/--spot-y, no per-frame React state). Content is lifted to its
 * own stacking layer so it sits above the glow.
 */
export function Spotlight({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const handleMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <Tag className={cn("spotlight", className)} onMouseMove={handleMove}>
      <div className="relative z-[1]">{children}</div>
    </Tag>
  );
}

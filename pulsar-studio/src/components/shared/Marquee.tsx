"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Infinite horizontal ticker — CSS-only (no JS animation loop), so it's
 * cheap even running continuously. Duplicates its children once so the
 * loop seams invisibly; pauses entirely under prefers-reduced-motion
 * (rendered once, static) rather than just slowing down.
 */
export function Marquee({
  children,
  durationSeconds = 22,
  className,
  itemClassName,
}: {
  children: ReactNode;
  durationSeconds?: number;
  className?: string;
  itemClassName?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        <div className={itemClassName}>{children}</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <div
        className="flex w-max"
        style={{ animation: `marquee-track ${durationSeconds}s linear infinite` }}
      >
        <div className={itemClassName}>{children}</div>
        <div className={itemClassName} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Staggers each line in on mount — reserved for the hero headline only.
 * Used once so it reads as a deliberate moment, not a template effect.
 *
 * Always renders the same nested-span structure regardless of the
 * reduced-motion preference (branching to a plain <span> would hydrate
 * differently from the server's assumption and throw error #418) —
 * reduced motion just zeroes the transition instead.
 */
export function TextReveal({
  lines,
  delayStart = 0,
  as: Tag = "h1",
  className,
}: {
  lines: ReactNode[];
  delayStart?: number;
  as?: "h1" | "h2" | "div";
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: prefersReducedMotion ? 0 : delayStart + i * 0.09,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

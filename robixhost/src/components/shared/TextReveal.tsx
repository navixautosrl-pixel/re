"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Staggers each line in on mount — used once, for the hero headline.
 * Not applied to body copy or repeated on every heading in the page;
 * a single deliberate moment reads as intentional, doing it everywhere
 * reads as a template effect.
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

  if (prefersReducedMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: delayStart + i * 0.08,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

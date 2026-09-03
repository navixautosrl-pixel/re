"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Crossfades to the new figure when `value` changes (monthly/yearly
 * toggle) instead of a hard, jarring swap — the one legitimate use of a
 * "number counter"-style effect here, since the number itself is real
 * (not a fabricated stat being counted up for show).
 */
export function AnimatedPrice({ value, className }: { value: string; className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className} style={{ display: "inline-grid" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ gridArea: "1 / 1" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

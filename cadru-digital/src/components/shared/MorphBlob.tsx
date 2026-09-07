"use client";

import { motion, useReducedMotion } from "framer-motion";

const SHAPES = [
  "62% 38% 55% 45% / 45% 55% 45% 55%",
  "40% 60% 65% 35% / 55% 40% 60% 45%",
  "55% 45% 35% 65% / 35% 60% 40% 65%",
  "62% 38% 55% 45% / 45% 55% 45% 55%",
];

/**
 * A living, color-shifting blob — the "moving graphic" the brief asked
 * for where a real photo/GIF isn't available. Pure CSS border-radius +
 * gradient-position morphing (no SVG path interpolation fragility, no
 * image weight).
 *
 * Always passes the same shape of `animate` prop (never branches it
 * structurally on prefersReducedMotion, which is null during SSR and
 * resolved on the client — that mismatch throws a hydration error, as it
 * did earlier in this project). Reduced motion instead collapses the
 * transition to a single instant frame.
 */
export function MorphBlob({ className, size = 520 }: { className?: string; size?: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        background: "var(--gradient-brand)",
        backgroundSize: "200% 200%",
        filter: "blur(2px)",
      }}
      animate={{ borderRadius: SHAPES, backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{
        duration: prefersReducedMotion ? 0 : 14,
        repeat: prefersReducedMotion ? 0 : Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    />
  );
}

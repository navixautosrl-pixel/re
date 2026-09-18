"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const line: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%" },
};

/**
 * Line-by-line clip-reveal for large display headlines.
 */
export function TextReveal({
  lines,
  className,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {lines.map((text) => (
          <span key={text} className="block">
            {text}{" "}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span className={className} initial="hidden" animate="visible" variants={container} transition={{ delay }}>
      {lines.map((text) => (
        // Extra top padding + matching negative margin gives the clip box
        // headroom so diacritics (ă, â, î, ș, ț) aren't sliced by
        // overflow-hidden under tight display line-heights.
        <span key={text} className="-mt-[0.22em] block overflow-hidden pt-[0.22em]">
          <motion.span className="block" variants={line} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            {/* Trailing space so the h1's text content reads as a sentence.
                Without it the lines concatenate: "Ideicarearata...". */}
            {text}{" "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

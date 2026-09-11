"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const line: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%" },
};

/**
 * Line-by-line clip-reveal for large display headlines. Each string in
 * `lines` becomes its own masked row that slides up into place.
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
            {text}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
      transition={{ delay }}
    >
      {lines.map((text) => (
        // Extra top padding + matching negative margin: gives the clip box
        // headroom so Romanian diacritics (Ă, Â, Î) don't get sliced by
        // overflow-hidden under very tight display line-heights, while
        // keeping the visual line position unchanged.
        <span key={text} className="-mt-[0.22em] block overflow-hidden pt-[0.22em]">
          <motion.span
            className="block"
            variants={line}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {text}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

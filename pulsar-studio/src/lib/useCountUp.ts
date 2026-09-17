"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";

/**
 * Animates a number counting up from 0 once it scrolls into view. Uses
 * `animate()`'s onUpdate callback to drive setState — never a synchronous
 * branch in an effect body — so it doesn't trigger cascading-render lint
 * warnings.
 */
export function useCountUp(target: number, durationSeconds = 1.4) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: prefersReducedMotion ? 0 : durationSeconds,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, durationSeconds, prefersReducedMotion]);

  return { ref, value };
}

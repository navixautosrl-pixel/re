import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/**
 * Counts from 0 to `target` once `active` becomes true (e.g. scrolled into
 * view). Under reduced motion the animation runs with duration 0, so the
 * value still arrives through the same onUpdate path instead of a separate
 * synchronous setState branch.
 */
export function useCountUp(target: number, decimals: number, active: boolean, prefersReducedMotion: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const controls = animate(0, target, {
      duration: prefersReducedMotion ? 0 : 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [active, target, prefersReducedMotion]);

  return value.toFixed(decimals);
}

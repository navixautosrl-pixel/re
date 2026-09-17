"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * A soft glow that trails the cursor — desktop, fine-pointer only. Purely
 * decorative (pointer-events: none, mix-blend-mode: screen so it brightens
 * the dark background rather than sitting as a flat circle). Hidden via CSS
 * for coarse pointers / reduced-motion so no React state is needed to gate
 * rendering — motion values (`x.set`/`y.set`) update outside React's render
 * cycle, so the pointermove listener never triggers a re-render either.
 */
export function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 120, damping: 22, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 120, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-[360px] rounded-full opacity-[0.16] mix-blend-screen motion-safe:pointer-fine:block"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, var(--color-accent-2) 0%, transparent 70%)",
      }}
    />
  );
}

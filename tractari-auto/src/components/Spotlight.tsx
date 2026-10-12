"use client";

import { useEffect } from "react";

/** One delegated pointer listener: cards with .spot get --mx/--my for the glow (fine pointers only). */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".spot");
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => { document.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return null;
}

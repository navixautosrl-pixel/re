"use client";

import { useEffect, useRef } from "react";

type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number };

/**
 * A quiet field of slow-drifting points behind the intro's logo — ambient
 * texture, not an event. No burst, no trigger; it's simply present while
 * the connection status resolves, and fades out with the rest of the
 * overlay during the dissolve. Canvas-2D, capped particle count, off
 * entirely under reduced-motion.
 */
export function AmbientField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = window.innerWidth < 640 ? 30 : 60;
    const motes: Mote[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: 0.6 + Math.random() * 1,
      a: 0.08 + Math.random() * 0.16,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < 0 || m.x > window.innerWidth) m.vx *= -1;
        if (m.y < 0 || m.y > window.innerHeight) m.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(244, 244, 243, ${m.a})`;
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: "primary" | "white";
};

/**
 * Lightweight canvas-2D particle burst for the cinematic intro's
 * logo-decomposition moment. Deliberately not WebGL — this is a short,
 * one-shot effect, and canvas-2D is cheaper, has no GPU-driver surface
 * area, and never competes with the real 3D hero scene that follows it.
 */
export function ParticleBurst({
  active,
  intensity,
  onComplete,
}: {
  active: boolean;
  intensity: "full" | "reduced";
  onComplete?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onComplete?.();
      return;
    }

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

    const count = intensity === "full" ? 140 : 50;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      const maxLife = 55 + Math.random() * 35;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2.4,
        life: 0,
        maxLife,
        hue: Math.random() > 0.82 ? "white" : "primary",
      };
    });

    let frame = 0;
    const totalFrames = intensity === "full" ? 80 : 45;

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life++;

        const t = p.life / p.maxLife;
        const alpha = Math.max(0, 1 - t);
        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.fillStyle =
          p.hue === "white"
            ? `rgba(231, 236, 242, ${alpha})`
            : `rgba(59, 147, 255, ${alpha})`;
        ctx.shadowBlur = p.hue === "white" ? 0 : 8;
        ctx.shadowColor = "rgba(59, 147, 255, 0.8)";
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (frame < totalFrames) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

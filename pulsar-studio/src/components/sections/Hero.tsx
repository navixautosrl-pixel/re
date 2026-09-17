"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ChevronDown, Gauge, Search, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextReveal } from "@/components/shared/TextReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Desktop-only mouse parallax on the mockup + its glow orbs. Motion
  // values update outside React's render cycle, so this never triggers a
  // re-render on every mousemove.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mockupX = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const mockupY = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });
  const orbX = useSpring(px, { stiffness: 40, damping: 20, mass: 0.8 });
  const orbY = useSpring(py, { stiffness: 40, damping: 20, mass: 0.8 });
  const orbXInverse = useTransform(orbX, (v) => -v);
  const orbYInverse = useTransform(orbY, (v) => -v);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion || !sectionRef.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = sectionRef.current.getBoundingClientRect();
    px.set(((e.clientX - rect.left) / rect.width - 0.5) * 24);
    py.set(((e.clientY - rect.top) / rect.height - 0.5) * 24);
  }

  function resetParallax() {
    px.set(0);
    py.set(0);
  }

  return (
    <section
      id="acasa"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background pt-28 sm:pt-32"
    >
      <div className="gradient-mesh" aria-hidden="true" />
      <div className="grid-field absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="container-max relative z-10 grid flex-1 items-center gap-14 px-5 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-10 lg:pb-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent-2"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-2 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent-2" />
            </span>
            Agenție digitală premium
          </motion.div>

          <h1 className="font-display text-[13vw] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground sm:text-6xl lg:text-7xl">
            <TextReveal
              lines={["Construim site-uri", "care îți cresc"]}
              delay={0.15}
            />
            <span className="-mt-[0.22em] block overflow-hidden pt-[0.22em]">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.15 + 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="gradient-text block"
              >
                afacerea.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            Website-uri la cheie, <span className="text-foreground">SEO</span> și{" "}
            <span className="text-foreground">marketing digital</span> — tot ce ai nevoie pentru o prezență online care
            contează.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton>
              <Button href="#contact" variant="primary" size="lg">
                Cere o ofertă
              </Button>
            </MagneticButton>
            <Button href="#servicii" variant="outline" size="lg" icon={false} className="rounded-full">
              Vezi serviciile
            </Button>
          </motion.div>
        </div>

        {/* Browser-window mockup — an abstract, illustrative preview of "a
            premium website," not a screenshot of a real client project. */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <motion.div className="glow-spot -right-10 -top-10 size-56 bg-accent-2" style={{ x: orbX, y: orbY }} aria-hidden="true" />
          <motion.div
            className="glow-spot -bottom-10 -left-10 size-56 bg-accent-3"
            style={{ x: orbXInverse, y: orbYInverse }}
            aria-hidden="true"
          />

          <motion.div
            style={{ x: mockupX, y: mockupY }}
            className="glass relative overflow-hidden rounded-lg shadow-[0_30px_80px_-24px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-accent-4/60" />
              <span className="size-2.5 rounded-full bg-accent-2/60" />
              <span className="ml-3 flex-1 truncate rounded-full bg-white/5 px-3 py-1 text-[0.65rem] text-muted-foreground">
                pulsarstudio.ro
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="h-28 rounded-md bg-[image:var(--gradient-blue-purple)] opacity-90" />
              <div className="space-y-2">
                <div className="h-2.5 w-3/4 rounded-full bg-white/12" />
                <div className="h-2.5 w-1/2 rounded-full bg-white/8" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[Search, Smartphone, Gauge].map((Icon, i) => (
                  <div key={i} className="glow-border rounded-md border border-border bg-white/[0.03] p-3">
                    <Icon className="size-4 text-accent-2" aria-hidden="true" />
                    <div className="mt-3 h-1.5 w-3/4 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {!prefersReducedMotion ? (
            <>
              <motion.div
                className="glass floating absolute -left-6 top-10 hidden rounded-md px-3.5 py-2.5 text-xs font-medium text-foreground sm:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <span className="text-accent-2">●</span> SEO ready
              </motion.div>
              <motion.div
                className="glass floating-delayed absolute -right-4 bottom-16 hidden rounded-md px-3.5 py-2.5 text-xs font-medium text-foreground sm:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                <span className="text-accent-3">●</span> Design custom
              </motion.div>
            </>
          ) : null}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.4 }}
        className="relative z-10 hidden justify-center pb-8 sm:flex"
        aria-hidden="true"
      >
        <motion.div animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="size-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}

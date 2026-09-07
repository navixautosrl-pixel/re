"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

/**
 * The hero visual: an abstract browser window showing a skeleton of "a
 * website being built" — not a literal screenshot (we have no real client
 * site to show yet) and not a generic 3D object. It supports the actual
 * business message: we build fast, structured, well-composed websites.
 */
export function BrowserMockup() {
  const prefersReducedMotion = useReducedMotion();

  // Always the same variant labels/structure on server and client (never
  // branch to `undefined` based on prefersReducedMotion, which is null
  // during SSR and settles after mount — that mismatch throws a hydration
  // error). Reduced motion just collapses the timing to zero instead.
  const d = prefersReducedMotion ? 0 : undefined;
  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: d ?? 0.09, delayChildren: d ?? 0.3 } },
  };
  const bar: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: { duration: d ?? 0.6, ease: EASE_PREMIUM } },
  };
  const fade: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: d ?? 0.5, ease: EASE_PREMIUM } },
  };

  return (
    <div className="relative">
      <div
        className="absolute -inset-8 -z-10 opacity-[0.15] blur-2xl"
        style={{ background: "radial-gradient(closest-side, var(--color-accent), transparent)" }}
        aria-hidden="true"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <div className="ml-3 flex-1 rounded-xs bg-background px-3 py-1.5 font-mono text-[0.7rem] text-muted-foreground">
            cadrudigital.ro
          </div>
        </div>

        <div className="space-y-6 p-7 sm:p-9">
          <motion.div variants={fade} className="flex items-center justify-between">
            <div className="h-2 w-16 rounded-full bg-border-strong" />
            <div className="flex gap-2">
              <div className="h-2 w-8 rounded-full bg-border" />
              <div className="h-2 w-8 rounded-full bg-border" />
              <div className="h-2 w-8 rounded-full bg-border" />
            </div>
          </motion.div>

          <div className="space-y-3 pt-4">
            <motion.div variants={bar} className="h-4 w-[85%] origin-left rounded-full bg-foreground/90" />
            <motion.div variants={bar} className="h-4 w-[55%] origin-left rounded-full bg-foreground/90" />
          </div>

          <motion.div variants={fade} className="space-y-2 pt-1">
            <div className="h-2 w-full rounded-full bg-border" />
            <div className="h-2 w-[80%] rounded-full bg-border" />
          </motion.div>

          <motion.div variants={fade} className="flex gap-3 pt-2">
            <div className="h-9 w-32 rounded-sm bg-accent" />
            <div className="h-9 w-28 rounded-sm border border-border-strong" />
          </motion.div>

          <div className="grid grid-cols-3 gap-3 pt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                variants={fade}
                className="aspect-[4/3] rounded-sm border border-border bg-surface-elevated p-3"
              >
                <div className="h-1.5 w-1/2 rounded-full bg-border-strong" />
                <div className="mt-2 h-1.5 w-3/4 rounded-full bg-border" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: d ?? 0.6, delay: d ?? 1, ease: EASE_PREMIUM }}
        className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-sm border border-border-strong bg-surface-elevated px-4 py-2.5 shadow-xl sm:flex"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-medium text-foreground">Rapid · SEO-ready</span>
      </motion.div>
    </div>
  );
}

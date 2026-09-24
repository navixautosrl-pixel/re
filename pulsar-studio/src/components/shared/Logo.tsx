"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * The mark is the hero's signal motif compressed to logo size: a bright core
 * with rings broadcasting out of it. Same idea as SignalField, same reason —
 * the business exists so a site reaches people — so the logo and the hero
 * read as one system instead of two unrelated graphics.
 *
 * Geometry: core at (9.5, 16); three arcs on the same centre at radii 7,
 * 11.5 and 15. Each one spans a wider angle than the one inside it (±38°,
 * ±52°, ±64°) and is drawn thinner — so the rings appear to open out as
 * they travel, instead of sitting in the uniform fan that would just read
 * as a rotated Wi-Fi glyph.
 */
const ARCS = [
  { d: "M15.02 11.69 A7 7 0 0 1 15.02 20.31", width: 2.6, delay: 0.1 },
  { d: "M16.58 6.94 A11.5 11.5 0 0 1 16.58 25.06", width: 2.2, delay: 0.22 },
  { d: "M16.08 2.52 A15 15 0 0 1 16.08 29.48", width: 1.8, delay: 0.34 },
];

type LogoProps = {
  /** Hide the wordmark and render the mark alone (used at very small widths). */
  markOnly?: boolean;
  className?: string;
};

export function Logo({ markOnly = false, className }: LogoProps) {
  const prefersReducedMotion = useReducedMotion();

  // The whole thing is one <a>'s content, so the accessible name comes from
  // the link. The SVG is decoration on top of the wordmark and is hidden
  // from screen readers; when the wordmark is off, the name is spelled out.
  return (
    <span className={cn("group/logo inline-flex items-center gap-2.5", className)}>
      <motion.svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0 overflow-visible"
        fill="none"
        aria-hidden="true"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="shown"
        whileHover={prefersReducedMotion ? undefined : "pulse"}
      >
        <defs>
          <linearGradient id="cwp-logo-gradient" gradientUnits="userSpaceOnUse" x1="4" y1="30" x2="28" y2="2">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="55%" stopColor="var(--color-accent-3)" />
            <stop offset="100%" stopColor="var(--color-accent-2)" />
          </linearGradient>
        </defs>

        {ARCS.map((arc) => (
          <motion.path
            key={arc.d}
            d={arc.d}
            stroke="url(#cwp-logo-gradient)"
            strokeWidth={arc.width}
            strokeLinecap="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              shown: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  duration: prefersReducedMotion ? 0 : 0.75,
                  delay: prefersReducedMotion ? 0 : arc.delay,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
              // Hover re-broadcasts: each ring pushes out and fades, in the
              // same order it was drawn.
              pulse: {
                opacity: [1, 0.35, 1],
                transition: { duration: 0.9, delay: arc.delay * 0.6, ease: "easeInOut" },
              },
            }}
          />
        ))}

        <motion.circle
          cx="9.5"
          cy="16"
          r="3.6"
          fill="url(#cwp-logo-gradient)"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            shown: {
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 420,
                damping: 18,
                duration: prefersReducedMotion ? 0 : undefined,
              },
            },
            pulse: { scale: [1, 1.18, 1], transition: { duration: 0.6, ease: "easeInOut" } },
          }}
          style={{ transformOrigin: "9.5px 16px" }}
        />
      </motion.svg>

      {markOnly ? (
        <span className="sr-only">{siteConfig.name}</span>
      ) : (
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          CreareWebsite
          <span className="bg-[image:var(--gradient-blue-purple)] bg-clip-text text-transparent">Pro</span>
        </span>
      )}
    </span>
  );
}

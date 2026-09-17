"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCountUp } from "@/lib/useCountUp";
import { gym } from "../data";

const stats = [
  { value: 6, suffix: "", label: "Tipuri de clase" },
  { value: 18, suffix: "h", label: "Deschis zilnic" },
  { value: 4, suffix: "", label: "Antrenori dedicați" },
];

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: current } = useCountUp(value);
  return (
    <div>
      <span ref={ref} className="font-fitness block text-5xl" style={{ color: "#0a0a0a" }}>
        {current}
        {suffix}
      </span>
      <span className="mt-1 block text-xs font-bold uppercase tracking-wide" style={{ color: "#0a0a0a" }}>
        {label}
      </span>
    </div>
  );
}

export function FitnessHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="acasa" className="relative flex min-h-[100svh] flex-col pt-[105px] lg:flex-row" style={{ background: "var(--f-bg)" }}>
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "repeating-linear-gradient(-45deg, var(--f-accent) 0px, var(--f-accent) 2px, transparent 2px, transparent 28px)",
        }}
        animate={prefersReducedMotion ? {} : { backgroundPosition: ["0px 0px", "-160px 160px"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />

      {/* Left: headline panel */}
      <div className="relative flex flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:w-3/5 lg:flex-none lg:py-0">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--f-accent)" }}
        >
          {gym.city} · Sală & antrenament personal
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-fitness mt-5 text-[15vw] uppercase leading-[0.92] text-[var(--f-fg)] sm:text-7xl lg:text-8xl"
        >
          Forța se
          <br />
          <span style={{ color: "var(--f-accent)" }}>construiește</span>
          <br />
          aici.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 max-w-md text-base leading-relaxed"
          style={{ color: "var(--f-muted)" }}
        >
          {gym.tagline} Echipament complet, antrenori dedicați și un program gândit pentru rezultate reale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link
            href="#abonamente"
            className="rounded-md px-8 py-4 text-sm font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--f-accent)", color: "#0a0a0a" }}
          >
            Vezi abonamente
          </Link>
          <Link
            href="#program"
            className="rounded-md border px-8 py-4 text-sm font-bold uppercase tracking-wide text-[var(--f-fg)] transition-colors hover:border-[var(--f-accent)]"
            style={{ borderColor: "var(--f-border)" }}
          >
            Vezi programul
          </Link>
        </motion.div>
      </div>

      {/* Right: skewed stat panel — a hard diagonal cut, not a soft card,
          for a genuinely different composition than the other demos'
          centered/two-column heroes. Stacks flat below the headline on
          mobile since the skew only reads at real width. */}
      <motion.div
        initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fitness-hero-skew relative flex flex-col justify-center gap-8 px-5 py-16 sm:px-8 lg:w-2/5 lg:flex-none lg:py-0"
        style={{ background: "var(--f-accent)" }}
      >
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </motion.div>
    </section>
  );
}

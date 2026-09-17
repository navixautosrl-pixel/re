"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { gym } from "../data";

export function FitnessHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="acasa"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pt-24 sm:px-8"
      style={{ background: "var(--f-bg)" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "repeating-linear-gradient(-45deg, var(--f-accent) 0px, var(--f-accent) 2px, transparent 2px, transparent 28px)",
        }}
        animate={prefersReducedMotion ? {} : { backgroundPosition: ["0px 0px", "-160px 160px"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 45% at 85% 15%, color-mix(in srgb, var(--f-accent) 20%, transparent), transparent 70%), radial-gradient(40% 40% at 10% 85%, color-mix(in srgb, var(--f-accent-2) 18%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
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

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden aspect-square items-end gap-3 lg:flex"
          aria-hidden="true"
        >
          {[38, 62, 84, 55, 96, 70].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-md"
              style={{ background: i % 2 === 0 ? "var(--f-accent)" : "var(--f-accent-2)" }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

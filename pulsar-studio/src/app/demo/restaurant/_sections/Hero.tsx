"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { restaurant } from "../data";

export function RestaurantHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="acasa"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-24 text-center"
      style={{ background: "var(--r-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--r-accent) 22%, transparent), transparent 70%), radial-gradient(50% 40% at 20% 100%, color-mix(in srgb, var(--r-accent-2) 18%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--r-accent) 0px, var(--r-accent) 1px, transparent 1px, transparent 14px)",
        }}
        animate={prefersReducedMotion ? {} : { backgroundPosition: ["0px 0px", "80px 80px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-xs font-semibold uppercase tracking-[0.3em]"
        style={{ color: "var(--r-accent)" }}
      >
        {restaurant.city} · Bucătărie de foc deschis
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="font-restaurant relative mt-6 max-w-3xl text-5xl leading-[1.05] text-[var(--r-fg)] sm:text-6xl lg:text-7xl"
      >
        O experiență culinară care <em className="italic" style={{ color: "var(--r-accent)" }}>rămâne cu tine.</em>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="relative mt-6 max-w-xl text-base leading-relaxed"
        style={{ color: "var(--r-muted)" }}
      >
        {restaurant.tagline} Ingrediente de sezon, gătite la jar, într-o sală intimă gândită pentru seri memorabile.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="relative mt-9 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="#rezervare"
          className="rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--r-accent)", color: "var(--r-bg)" }}
        >
          Rezervă o masă
        </Link>
        <Link
          href="#meniu"
          className="rounded-full border px-7 py-3.5 text-sm font-semibold tracking-wide text-[var(--r-fg)] transition-colors hover:border-[var(--r-accent)]"
          style={{ borderColor: "var(--r-border)" }}
        >
          Vezi meniul
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 hidden sm:block"
        aria-hidden="true"
      >
        <motion.div animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="size-5" style={{ color: "var(--r-muted)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

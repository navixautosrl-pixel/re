"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Marquee } from "@/components/shared/Marquee";
import { restaurant } from "../data";

const tickerWords = ["Bucătărie de foc deschis", "Meniu de sezon", "Rezervări", "Grătar pe cărbune", "Sală intimă"];

export function RestaurantHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="acasa" className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-24" style={{ background: "var(--r-bg)" }}>
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
          backgroundImage: "repeating-linear-gradient(45deg, var(--r-accent) 0px, var(--r-accent) 1px, transparent 1px, transparent 14px)",
        }}
        animate={prefersReducedMotion ? {} : { backgroundPosition: ["0px 0px", "80px 80px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* Mask-reveal: each line clips in from a hard edge rather than
            fading, a slower and more editorial move than the other demos'
            stagger-fade headlines. */}
        <h1 className="font-restaurant max-w-3xl text-5xl leading-[1.05] text-[var(--r-fg)] sm:text-6xl lg:text-7xl">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              O experiență culinară
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block italic"
              style={{ color: "var(--r-accent)" }}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              care rămâne cu tine.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mt-6 max-w-xl text-base leading-relaxed"
          style={{ color: "var(--r-muted)" }}
        >
          {restaurant.tagline} Ingrediente de sezon, gătite la jar, într-o sală intimă gândită pentru seri memorabile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
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
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative border-t py-4"
        style={{ borderColor: "var(--r-border)" }}
      >
        <Marquee durationSeconds={26} itemClassName="flex shrink-0 items-center gap-8 pr-8">
          {tickerWords.map((word) => (
            <span key={word} className="flex items-center gap-8 font-restaurant text-lg italic" style={{ color: "var(--r-muted)" }}>
              {word}
              <span style={{ color: "var(--r-accent)" }}>✳</span>
            </span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
}

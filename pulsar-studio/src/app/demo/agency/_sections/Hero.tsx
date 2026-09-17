"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TextReveal } from "@/components/shared/TextReveal";
import { Marquee } from "@/components/shared/Marquee";
import { agency } from "../data";

const wordTexture = ["Brand", "Digital", "Strategie", "Design", "Conținut", "Campanii"];

export function AgencyHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-36 sm:px-8 sm:pb-28 sm:pt-44" style={{ background: "var(--a-bg)" }}>
      {/* Ghost word-texture behind the headline — agency's signature
          background motif, distinct from the other demos' orb/grid/ticker
          treatments. */}
      <div className="pointer-events-none absolute inset-x-0 top-16 select-none opacity-[0.05] sm:top-10" aria-hidden="true">
        <Marquee durationSeconds={38} itemClassName="flex shrink-0 items-center gap-10 pr-10">
          {wordTexture.map((word) => (
            <span key={word} className="font-agency whitespace-nowrap text-[16vw] uppercase leading-none text-[var(--a-fg)] sm:text-[9vw]">
              {word}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: "var(--a-accent)" }}
        >
          Studio de brand & digital
        </motion.p>

        <h1 className="font-agency mt-6 text-[13vw] uppercase leading-[0.98] text-[var(--a-fg)] sm:text-7xl lg:text-8xl">
          <TextReveal lines={["Idei care", "arată ca"]} delay={0.1} />
          <span className="-mt-[0.22em] block overflow-hidden pt-[0.22em]">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, delay: 0.1 + 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="block"
              style={{ color: "var(--a-accent)" }}
            >
              rezultate.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-8 max-w-lg text-lg leading-relaxed"
          style={{ color: "var(--a-muted)" }}
        >
          {agency.tagline}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} className="mt-9 flex flex-wrap gap-4">
          <Link href="#proiecte" className="rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: "var(--a-fg)" }}>
            Vezi proiectele
          </Link>
          <Link href="#contact" className="rounded-full border px-7 py-3.5 text-sm font-semibold text-[var(--a-fg)]" style={{ borderColor: "var(--a-border)" }}>
            Începe un proiect
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

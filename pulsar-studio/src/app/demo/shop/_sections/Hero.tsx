"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { shop } from "../data";

export function ShopHero() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40" style={{ background: "var(--s-bg)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--s-accent)" }}
          >
            Colecția curentă
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--s-fg)] sm:text-6xl"
          >
            {shop.tagline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-5 max-w-md text-base leading-relaxed"
            style={{ color: "var(--s-muted)" }}
          >
            Ceramică, textile și accesorii gândite să dureze — materiale naturale, producție în serii mici.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-8">
            <Link
              href="#produse"
              className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--s-fg)" }}
            >
              Vezi produsele
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid aspect-square grid-cols-2 gap-3"
          aria-hidden="true"
        >
          <div className="rounded-lg" style={{ background: "#c9a084" }} />
          <div className="mt-8 rounded-lg" style={{ background: "#8a9a8e" }} />
          <div className="-mt-8 rounded-lg" style={{ background: "#b5673e" }} />
          <div className="rounded-lg" style={{ background: "#5f6f5a" }} />
        </motion.div>
      </div>
    </section>
  );
}

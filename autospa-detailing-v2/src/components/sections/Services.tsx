"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { services } from "@/lib/constants";

export function Services() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="servicii" className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <p className="font-display-caps text-sm tracking-[0.05em] text-accent">Servicii</p>
          <h2 className="font-display-caps mt-3 max-w-2xl text-4xl leading-[0.95] sm:text-5xl">
            Tot ce are nevoie mașina ta
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05} className={i === 0 ? "col-span-2 sm:col-span-1" : ""}>
              <motion.div
                className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-border"
                whileHover={prefersReducedMotion ? undefined : "hover"}
                initial="rest"
              >
                <motion.div
                  className="photo-slot absolute inset-0"
                  variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-display-caps text-lg leading-tight sm:text-xl">{s.name}</h3>
                  <p className="mt-1.5 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Prețul depinde de mărimea și starea mașinii — sună pentru o ofertă exactă.
        </p>
      </div>
    </section>
  );
}

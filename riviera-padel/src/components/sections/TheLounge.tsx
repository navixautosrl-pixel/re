"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";

export function TheLounge() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <section id="lounge" ref={ref} className="relative isolate min-h-[85vh] overflow-hidden bg-background">
      <motion.div style={{ y }} className="absolute inset-0 scale-[1.15]">
        <MediaPlaceholder variant="lounge" className="h-full w-full" tag="Lounge Riviera — în curând" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/30" />
      <div className="court-glow" />

      <div className="container-max relative z-10 flex min-h-[85vh] flex-col justify-end px-5 pb-20 pt-32 sm:px-8 lg:px-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Mai mult decât un teren</p>
          <h2 className="font-display mt-4 max-w-3xl text-6xl uppercase leading-[0.9] tracking-[-0.01em] text-foreground sm:text-8xl">
            The Lounge
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/85">
            Jocul se termină. Experiența nu. Riviera este locul unde meciul e doar pretextul — restul
            serii se întâmplă în lounge, cu prietenii vechi și cu cei pe care abia i-ai cunoscut pe teren.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

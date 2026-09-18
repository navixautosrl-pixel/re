"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { PulsarField } from "@/components/shared/PulsarField";
import { useReducedMotion } from "@/lib/useReducedMotion";

const HEADLINE = ["Construim", "site-uri care", "îți cresc"];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // The hero recedes as the next section arrives rather than just scrolling
  // away — the page's one scroll-linked moment above the fold.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Neutralise the ranges under reduced motion rather than dropping the style
  // binding: if framer stops managing an element mid-flight it keeps whatever
  // inline value it last wrote.
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", prefersReducedMotion ? "0%" : "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, prefersReducedMotion ? 1 : 0]);
  const fieldScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 1.35]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      id="acasa"
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-background pb-8 pt-28 sm:pb-10 sm:pt-32"
    >
      <div className="grid-field absolute inset-0 opacity-40" aria-hidden="true" />

      {/* Signature visual: bleeds off the right edge on desktop, sits behind
          the type on mobile so the headline always wins. */}
      <motion.div
        style={{ scale: fieldScale }}
        className="pointer-events-none absolute -right-[38%] top-1/2 w-[125vw] -translate-y-1/2 opacity-70 sm:-right-[26%] sm:w-[85vw] lg:-right-[8%] lg:w-[58vw] lg:opacity-100"
        aria-hidden="true"
      >
        <PulsarField />
      </motion.div>

      <div className="noise-overlay" aria-hidden="true" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-max relative z-10 px-5 sm:px-8 lg:px-10"
      >
        {/* Type as the hero. Scales from phone to ultrawide on one curve. */}
        {/* Uppercase Romanian needs real headroom: Î/Â carry a circumflex
            above cap height and Ș/Ț a comma below the baseline, so the
            reveal masks get generous padding with matching negative margins
            — the clip box grows, the layout doesn't. */}
        <h1
          className="font-display font-semibold uppercase leading-[0.95] tracking-[-0.04em] text-foreground"
          style={{ fontSize: "clamp(2.6rem, min(9.4vw, 12vh), 8.5rem)" }}
        >
          {HEADLINE.map((line, i) => (
            <span key={line} className="-my-[0.16em] block overflow-hidden py-[0.16em]">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.78,
                  delay: prefersReducedMotion ? 0 : 0.04 + i * 0.06,
                  ease,
                }}
              >
                {/* Trailing space: the lines are separate block spans, so the
                    h1's text content would otherwise run together. */}
                {line}{" "}
              </motion.span>
            </span>
          ))}
          <span className="-my-[0.16em] block overflow-hidden py-[0.16em]">
            <motion.span
              className="gradient-text block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.78, delay: prefersReducedMotion ? 0 : 0.22, ease }}
            >
              afacerea.
            </motion.span>
          </span>
        </h1>

        {/* Supporting cluster sits under the type, offset right on desktop so
            the composition is asymmetric rather than a centered stack. */}
        <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-12 lg:items-end lg:gap-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.46, ease }}
            className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-5 lg:col-start-1"
          >
            Website-uri la cheie, <span className="text-foreground">SEO</span> și{" "}
            <span className="text-foreground">marketing digital</span> — tot ce ai nevoie pentru o prezență online
            care contează.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.54, ease }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 lg:col-span-5 lg:col-start-8 lg:justify-end"
          >
            <MagneticButton>
              <Button href="#contact" variant="primary" size="lg">
                Cere o ofertă
              </Button>
            </MagneticButton>
            <Button href="#servicii" variant="outline" size="lg" icon={false} className="rounded-full">
              Vezi serviciile
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: prefersReducedMotion ? 0 : 0.66 }}
          className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground sm:mt-10 sm:text-sm"
        >
          <span>Agenție digitală premium</span>
          <a
            href="#servicii"
            className="group inline-flex items-center gap-2 py-1 transition-colors hover:text-foreground"
          >
            Derulează
            <motion.span
              animate={{ y: prefersReducedMotion ? 0 : [0, 5, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <ArrowDown className="size-4" aria-hidden="true" />
            </motion.span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

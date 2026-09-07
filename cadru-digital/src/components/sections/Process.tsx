"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { processSteps } from "@/lib/constants";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.4"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });

  return (
    <section id="proces" className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <SectionHeading eyebrow="Proces" title="Un proces clar, de la idee la lansare" align="center" />

        <div ref={ref} className="relative mx-auto mt-16 max-w-2xl">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border sm:left-[19px]" aria-hidden="true" />
          {/*
            Always render this element — branching its presence on
            prefersReducedMotion (null during SSR, resolved on client)
            would mismatch at hydration. Reduced motion instead pins the
            fill to a static value instead of the scroll-linked spring.
          */}
          <motion.div
            className="absolute left-[15px] top-2 w-px origin-top bg-accent sm:left-[19px]"
            style={{ scaleY: prefersReducedMotion ? 1 : progress, height: "calc(100% - 1rem)" }}
            aria-hidden="true"
          />

          <ol className="space-y-10">
            {processSteps.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.04}>
                <li className="relative flex gap-6 pl-0 sm:gap-8">
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-background font-mono text-xs text-muted-foreground sm:h-10 sm:w-10">
                    {step.index}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-display text-xl text-foreground sm:text-2xl">{step.name}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

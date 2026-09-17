"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/shared/Reveal";
import { processSteps } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Scroll-scrubbed timeline fill — not pinned, so it stays light on
      // mobile and never fights native scroll. Just one animated GSAP
      // element on the page, per the "don't overdo pinning/scrubbing"
      // guidance.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!lineRef.current || !containerRef.current) return;
        gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });
        gsap.to(lineRef.current, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section id="proces" className="section-y relative">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            De la idee <span className="gradient-text">la lansare.</span>
          </h2>
        </Reveal>

        <div ref={containerRef} className="relative mx-auto mt-16 max-w-2xl">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border sm:left-[19px]" aria-hidden="true" />
          <div
            ref={lineRef}
            className="absolute left-[15px] top-2 bottom-2 w-px bg-[image:var(--gradient-blue-purple)] sm:left-[19px]"
            aria-hidden="true"
          />

          <ol className="space-y-10">
            {processSteps.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.05} as="li">
                <div className="relative flex gap-6 pl-10 sm:gap-8 sm:pl-14">
                  <span className="glass absolute left-0 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-accent-2 sm:size-10">
                    {step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

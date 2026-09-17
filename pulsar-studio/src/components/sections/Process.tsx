"use client";

import { useCallback, useRef } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { useLazyGsap, type Gsap } from "@/lib/useLazyGsap";
import { processSteps } from "@/lib/constants";

export function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const setup = useCallback((gsap: Gsap) => {
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
  }, []);

  useLazyGsap(setup);

  return (
    <section id="proces" className="section-y relative">
      {/* The heading holds its position while the steps move past it — the
          section's own rhythm, distinct from the stacked blocks around it. */}
      <div className="container-max grid gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              De la idee la lansare.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {processSteps.length} pași, fără surprize. Știi în fiecare moment la ce lucrăm și ce urmează.
            </p>
          </div>
        </Reveal>

        <div ref={containerRef} className="relative lg:col-span-7 lg:col-start-6">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border sm:left-[19px]" aria-hidden="true" />
          <div
            ref={lineRef}
            className="absolute left-[15px] top-2 bottom-2 w-px bg-[image:var(--gradient-blue-purple)] sm:left-[19px]"
            aria-hidden="true"
          />

          <ol className="space-y-10 sm:space-y-12">
            {processSteps.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.05} as="li">
                <div className="relative flex gap-6 pl-10 sm:gap-8 sm:pl-14">
                  <span className="glass absolute left-0 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-accent-2 sm:size-10">
                    {step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{step.title}</h3>
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

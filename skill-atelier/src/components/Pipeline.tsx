"use client";

import { useEffect, useRef } from "react";
import { STAGES, skills } from "@/lib/skills";

const SCRUB_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

// The page's one scroll-driven set piece: the wire is scrubbed to scroll and each
// stage lights up as the wire reaches it. The HTML ships fully drawn and lit, so it
// reads complete with JS off, under reduced motion and below 768px. GSAP is only
// downloaded when the scrub will actually run (it was ~60% of mobile script CPU).
export function Pipeline() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(SCRUB_QUERY);
    let revert: (() => void) | undefined;
    let cancelled = false;

    async function setup() {
      revert?.();
      revert = undefined;
      if (!mq.matches || !root.current) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const stages = Array.from(root.current.querySelectorAll<HTMLElement>(".stage"));
      const ctx = gsap.context(() => {
        stages.forEach((el) => (el.dataset.lit = "false"));
        gsap.fromTo(
          ".wire",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: ".stage-list", start: "top 62%", end: "bottom 62%", scrub: 0.6 },
          }
        );
        stages.forEach((el) =>
          ScrollTrigger.create({
            trigger: el.querySelector(".stage-dot"),
            start: "center 62%",
            onEnter: () => (el.dataset.lit = "true"),
            onLeaveBack: () => (el.dataset.lit = "false"),
          })
        );
      }, root);
      // ScrollTrigger only re-measures on viewport resize. Content above the pipeline
      // changes height (the tool wall's "Show all" / filters), so re-measure then too.
      let raf = 0;
      let lastHeight = document.body.scrollHeight;
      const ro = new ResizeObserver(() => {
        if (document.body.scrollHeight === lastHeight) return;
        lastHeight = document.body.scrollHeight;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      ro.observe(document.body);
      revert = () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
        ctx.revert(); // kills tweens + ScrollTriggers and clears inline transforms
        stages.forEach((el) => (el.dataset.lit = "true"));
      };
    }

    setup();
    mq.addEventListener("change", setup);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", setup);
      revert?.();
    };
  }, []);

  return (
    <section
      ref={root}
      id="pipeline"
      aria-labelledby="pipeline-title"
      className="border-y border-line bg-board/60 py-[var(--space-section)]"
    >
      <div className="mx-auto grid w-[min(100%-2rem,76rem)] gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 id="pipeline-title" className="display text-[length:var(--step-3)]">One route through all of them</h2>
          <p className="mt-4 max-w-[30rem] text-ink-2">
            <code className="text-[0.92em]">site-builder</code> runs the stages in order and won&rsquo;t move on until
            each gate is met. Every gate is something you can check, not something you have to take on trust.
          </p>
        </div>

        <ol className="stage-list relative pl-12">
          {/* Track + ink wire. The wire ships at full height; GSAP scrubs its scaleY on wide screens. */}
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-[15px] w-[3px] bg-line" />
          <span aria-hidden="true" className="wire absolute top-3 bottom-3 left-[15px] w-[3px] origin-top bg-ink" />
          {STAGES.map((s, i) => {
            const n = skills.filter((k) => k.stage === s.id).length;
            return (
              <li key={s.id} className="stage relative pb-10 last:pb-0" data-lit="true">
                <span
                  className="stage-dot absolute top-0.5 -left-12 grid h-8 w-8 place-items-center rounded-full border-[1.5px] border-ink bg-signal text-sm font-bold text-ink"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="text-[length:var(--step-1)] font-bold leading-tight">
                  {s.label}
                  <span className="ml-2 text-base font-medium text-ink-2">
                    {n} {n === 1 ? "skill" : "skills"}
                  </span>
                </h3>
                <p className="mt-1.5 max-w-[36rem] text-ink-2">
                  <span className="font-semibold text-ink">Gate: </span>
                  {s.gate}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

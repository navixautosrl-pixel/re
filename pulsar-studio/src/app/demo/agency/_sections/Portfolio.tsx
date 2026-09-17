"use client";

import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/shared/Reveal";
import { Lightbox } from "@/components/shared/Lightbox";
import { caseStudies, type CaseStudy } from "../data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Desktop: a GSAP-pinned horizontal-scroll gallery — vertical scroll
 * drives horizontal movement through the case studies, the "cinematic
 * transition" an agency portfolio calls for, and this project's only use
 * of scroll-jacking (per the "don't pin more than 1-2 sections" rule —
 * Pulsar Studio's own Process section is the other one, on a different
 * page). Mobile/reduced-motion gets the plain stacked list instead —
 * pinned horizontal scroll is exactly the kind of effect that reads as
 * broken on a phone, not premium.
 */
export function AgencyPortfolio() {
  const [active, setActive] = useState<CaseStudy | null>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        const pin = pinRef.current;
        if (!track || !pin) return;

        const distance = track.scrollWidth - pin.clientWidth;
        if (distance <= 0) return;

        gsap.to(track, {
          x: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${distance}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: pinRef }
  );

  return (
    <section id="proiecte" style={{ background: "var(--a-bg)" }}>
      <div className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
        <Reveal className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--a-accent)" }}>
            Proiecte
          </p>
          <h2 className="font-agency mt-4 text-4xl uppercase text-[var(--a-fg)] sm:text-5xl">Case studies demo</h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--a-muted)" }}>
            Nu avem încă proiecte publice reale — acestea sunt studii de caz demonstrative ale tipului de lucru pe
            care îl facem.
          </p>
        </Reveal>
      </div>

      {/* Desktop pinned horizontal track */}
      <div ref={pinRef} className="relative mt-14 hidden h-screen items-center overflow-hidden lg:flex">
        <div ref={trackRef} className="flex gap-6 pl-8" style={{ width: "max-content" }}>
          {caseStudies.map((cs) => (
            <button
              key={cs.id}
              type="button"
              onClick={() => setActive(cs)}
              className="group relative block h-[60vh] w-[70vw] max-w-xl shrink-0 overflow-hidden rounded-lg text-left"
            >
              <div className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-105" style={{ background: cs.color }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{cs.category}</p>
                <h3 className="font-agency mt-2 max-w-md text-2xl uppercase leading-snug text-white">{cs.title}</h3>
                <span className="mt-4 inline-flex size-11 items-center justify-center rounded-full border border-white/30 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4 text-white" aria-hidden="true" />
                </span>
              </div>
            </button>
          ))}
          <div className="w-8 shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Mobile / reduced-motion: plain stacked list */}
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 lg:hidden">
        <div className="grid gap-1">
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.id} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => setActive(cs)}
                className="group block w-full border-t py-8 text-left transition-colors"
                style={{ borderColor: "var(--a-border)" }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--a-accent)" }}>
                      {cs.category}
                    </p>
                    <h3 className="font-agency mt-3 max-w-md text-xl uppercase leading-snug text-[var(--a-fg)] transition-colors group-hover:opacity-70 sm:text-2xl">
                      {cs.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--a-muted)" }}>
                      {cs.summary}
                    </p>
                  </div>
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:rotate-45"
                    style={{ borderColor: "var(--a-border)" }}
                  >
                    <ArrowUpRight className="size-4" style={{ color: "var(--a-fg)" }} aria-hidden="true" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        {active ? (
          <div>
            <div className="aspect-[21/9]" style={{ background: active.color }} />
            <div className="p-6 sm:p-9" style={{ background: "white" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--a-accent)" }}>
                {active.category} · Demo
              </p>
              <h3 className="font-agency mt-3 text-2xl uppercase text-black sm:text-3xl">{active.title}</h3>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Obiectiv</p>
                  <p className="mt-2 text-sm leading-relaxed text-black/75">{active.objective}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Soluție</p>
                  <p className="mt-2 text-sm leading-relaxed text-black/75">{active.solution}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {active.tech.map((t) => (
                  <span key={t} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/60">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Lightbox>
    </section>
  );
}

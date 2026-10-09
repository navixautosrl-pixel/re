"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Picture } from "@/components/Picture";

/**
 * PRIMARY moment #2 — the only scroll set piece. Desktop + motion allowed: the section pins
 * for ~140% of a viewport while the sunrise photo opens from a framed window to full bleed
 * and the three range facts step in. GSAP is imported only when that media query matches.
 * Mobile, reduced motion and no-JS get the same content as a static two-column layout.
 */
const FACTS = [
  { n: "2", label: "baze", text: "Fishmeal și Birdfood" },
  { n: "4", label: "rețete", text: "de la fără aromă la Scopex și căpșună" },
  { n: "20/24", label: "mm", text: "aceeași rețetă, în două diametre" },
];

export function RangeStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const query = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";
    let revert: (() => void) | undefined;
    let cancelled = false;

    async function setup() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !el) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=140%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
        });
        tl.fromTo("[data-story-photo]", { clipPath: "inset(10% 14% 10% 14% round 6px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1 })
          .fromTo("[data-story-photo] img", { scale: 1.15 }, { scale: 1, duration: 1 }, 0)
          .from("[data-story-fact]", { autoAlpha: 0, y: 40, stagger: 0.22, duration: 0.4, ease: "power3.out" }, 0.3);
      });
      revert = () => mm.revert();
    }

    const mq = window.matchMedia(query);
    if (mq.matches) setup();
    else {
      // Load GSAP later only if the viewport grows into the desktop layout.
      const onChange = () => mq.matches && !revert && setup();
      mq.addEventListener("change", onChange);
      return () => {
        cancelled = true;
        mq.removeEventListener("change", onChange);
        revert?.();
      };
    }
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section ref={root} aria-labelledby="story-title" className="relative overflow-hidden bg-night-2 min-[900px]:h-svh min-[900px]:min-h-[40rem]">
      <div className="grid h-full min-[900px]:grid-cols-[1.35fr_1fr]">
        <figure data-story-photo className="grain relative aspect-[4/3] overflow-hidden min-[900px]:aspect-auto min-[900px]:h-full">
          <Picture
            base="/img/catch-sunrise"
            widths={[640, 1024, 1448]}
            width={1448}
            height={1086}
            sizes="(min-width: 900px) 58vw, 100vw"
            alt="Pescar cu un crap oglindă mare, în zori, pe ponton, cu ceață pe apă și trestie în lumina răsăritului"
            className="h-full w-full object-cover object-[45%_center]"
          />
          <figcaption className="absolute bottom-4 left-4 text-[length:var(--step--1)] text-mist drop-shadow">Crap oglindă, în zori. Fotografie RbtFishPro.</figcaption>
        </figure>

        <div className="flex flex-col justify-center px-[var(--gutter)] py-14 min-[900px]:py-10">
          <h2 id="story-title" className="display text-[length:var(--step-3)]">
            O gamă scurtă, <span className="text-lamp">ușor de ales</span>
          </h2>
          <p className="measure mt-5 text-mist-2">
            Patru rețete, nu patruzeci. Alegi baza după apă și anotimp, apoi diametrul după peștele din baltă — restul ține de locul și răbdarea ta.
          </p>
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-5">
            {FACTS.map((f) => (
              <div key={f.label} data-story-fact className="col-span-2 grid grid-cols-subgrid items-baseline border-t border-white/10 pt-4">
                <dt className="display text-[length:var(--step-3)] text-cyan">
                  {f.n} <span className="sr-only">{f.label}</span>
                </dt>
                <dd>
                  <span aria-hidden="true" className="display-2 block text-[1.25rem]">{f.label}</span>
                  <span className="text-mist-2">{f.text}</span>
                </dd>
              </div>
            ))}
          </dl>
          <Link href="/despre-noi" className="link mt-8 self-start font-semibold">Despre RbtFishPro</Link>
        </div>
      </div>
    </section>
  );
}

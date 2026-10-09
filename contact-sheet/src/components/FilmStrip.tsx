"use client";

import { useEffect, useRef } from "react";
import { projects, shortName, frameNo } from "@/lib/projects";
import { Shot } from "@/components/Shot";

const QUERY = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

// Scroll set piece: on wide screens the strip of phone screenshots is pinned and
// slides horizontally as you scroll (GSAP ScrollTrigger, ease "none", lazy-loaded).
// Everywhere else it's a native, keyboard-scrollable scroll-snap strip.
export function FilmStrip() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    let revert: (() => void) | undefined;
    let cancelled = false;

    async function setup() {
      revert?.();
      revert = undefined;
      if (!mq.matches || !section.current || !track.current) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !section.current || !track.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const el = track.current;
      const ctx = gsap.context(() => {
        gsap.to(el, {
          x: () => Math.min(0, el.parentElement!.clientWidth - el.scrollWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            pin: true,
            start: "top top+=64",
            end: () => "+=" + Math.max(0, el.scrollWidth - el.parentElement!.clientWidth),
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      }, section);
      // Content above can change height (filters); keep trigger positions fresh.
      let raf = 0, h = document.body.scrollHeight;
      const ro = new ResizeObserver(() => {
        if (document.body.scrollHeight === h) return;
        h = document.body.scrollHeight;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      ro.observe(document.body);
      revert = () => { ro.disconnect(); cancelAnimationFrame(raf); ctx.revert(); };
    }

    setup();
    mq.addEventListener("change", setup);
    return () => { cancelled = true; mq.removeEventListener("change", setup); revert?.(); };
  }, []);

  return (
    <section ref={section} id="strip" aria-labelledby="strip-title" className="mt-[var(--section)] overflow-hidden bg-film py-12 text-table sm:py-16">
      <div className="mx-auto w-[min(100%-2rem,78rem)]">
        <h2 id="strip-title" className="display text-[length:var(--step-3)]">On a phone</h2>
        <p className="mt-3 max-w-[38rem] text-table/75">The same nine sites at 390 px wide, which is where most of their visitors see them first.</p>
      </div>
      <div
        className="strip-viewport mx-auto mt-8 w-[min(100%-2rem,78rem)] overflow-x-auto [scroll-snap-type:x_mandatory] min-[900px]:overflow-visible"
        tabIndex={0} role="region" aria-label="Phone screenshots, scroll horizontally"
      >
        <ol ref={track} className="flex w-max gap-4 pb-2 will-change-transform">
          {projects.map((p, i) => (
            <li key={p.slug} className="w-[min(62vw,15rem)] shrink-0 [scroll-snap-align:start]">
              <Shot slug={p.slug} view="mobile" alt={`${shortName(p)} on a phone`} sizes="15rem" className="aspect-[390/844] w-full rounded-[10px] border border-film-2 object-cover object-top" />
              <p className="mt-2 flex justify-between gap-2 text-sm">
                <span className="font-semibold">{shortName(p)}</span>
                <span className="edge text-edge" aria-hidden="true">{frameNo(i)}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

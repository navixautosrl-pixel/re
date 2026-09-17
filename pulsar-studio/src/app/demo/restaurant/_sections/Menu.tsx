"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { menu } from "../data";

/**
 * Horizontal scroll-snap panels, one per category — a swipeable "menu
 * booklet" rather than a tab bar swapping a list. Native CSS scroll-snap
 * (not a JS drag library), so touch scrolling stays exactly as fast and
 * familiar as it already is on the device.
 */
export function RestaurantMenu() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const panel = track.children[index] as HTMLElement | undefined;
    panel?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(Math.min(Math.max(index, 0), menu.length - 1));
  }

  return (
    <section id="meniu" className="py-24 sm:py-32" style={{ background: "var(--r-surface)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--r-accent)" }}>
              Meniu
            </p>
            <h2 className="font-restaurant mt-3 text-4xl text-[var(--r-fg)] sm:text-5xl">Ce servim</h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollToIndex(Math.max(active - 1, 0))}
              className="flex size-11 items-center justify-center rounded-full border transition-colors hover:border-[var(--r-accent)]"
              style={{ borderColor: "var(--r-border)" }}
              aria-label="Categoria anterioară"
            >
              <ArrowLeft className="size-4" style={{ color: "var(--r-fg)" }} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(Math.min(active + 1, menu.length - 1))}
              className="flex size-11 items-center justify-center rounded-full border transition-colors hover:border-[var(--r-accent)]"
              style={{ borderColor: "var(--r-border)" }}
              aria-label="Categoria următoare"
            >
              <ArrowRight className="size-4" style={{ color: "var(--r-fg)" }} aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-4 flex justify-center gap-2 px-5 sm:hidden">
        {menu.map((cat, i) => (
          <span
            key={cat.id}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === active ? "24px" : "6px", background: i === active ? "var(--r-accent)" : "var(--r-border)" }}
          />
        ))}
      </Reveal>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="mt-8 flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {menu.map((category) => (
          <div key={category.id} className="w-full shrink-0 snap-start px-1 sm:w-[calc(50%-1rem)] sm:px-4">
            <p className="font-restaurant text-2xl" style={{ color: "var(--r-accent)" }}>
              {category.label}
            </p>
            <ul className="mt-5 divide-y" style={{ borderColor: "var(--r-border)" }}>
              {category.items.map((item) => (
                <li key={item.name} className="flex items-start justify-between gap-6 border-b py-5" style={{ borderColor: "var(--r-border)" }}>
                  <div>
                    <h3 className="font-restaurant text-lg text-[var(--r-fg)]">{item.name}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: "var(--r-muted)" }}>
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap pt-1 text-sm font-semibold" style={{ color: "var(--r-accent)" }}>
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Reveal delay={0.15} className="hidden justify-center gap-2 sm:flex">
        {menu.map((cat, i) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Vezi ${cat.label}`}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === active ? "32px" : "8px", background: i === active ? "var(--r-accent)" : "var(--r-border)" }}
          />
        ))}
      </Reveal>
    </section>
  );
}

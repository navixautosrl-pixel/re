"use client";

import { useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { Lightbox } from "@/components/shared/Lightbox";
import { galleryItems } from "../data";

export function RestaurantGallery() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = galleryItems.find((g) => g.id === openId) ?? null;

  return (
    <section id="galerie" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--r-bg)" }}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--r-accent)" }}>
            Galerie
          </p>
          <h2 className="font-restaurant mt-3 text-4xl text-[var(--r-fg)] sm:text-5xl">Atmosfera Ember</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {galleryItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                className="group relative block aspect-square w-full overflow-hidden rounded-md"
              >
                <div className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-110" style={{ background: item.pattern }} />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-xs font-semibold text-white">{item.label}</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox open={!!active} onOpenChange={(v) => !v && setOpenId(null)}>
        {active ? (
          <div>
            <div className="aspect-video w-full" style={{ background: active.pattern }} />
            <div className="p-6">
              <p className="font-restaurant text-xl text-white">{active.label}</p>
              <p className="mt-1 text-sm text-white/60">Ember · {active.label}</p>
            </div>
          </div>
        ) : null}
      </Lightbox>
    </section>
  );
}

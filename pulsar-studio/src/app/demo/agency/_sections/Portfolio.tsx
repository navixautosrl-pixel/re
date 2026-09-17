"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Lightbox } from "@/components/shared/Lightbox";
import { caseStudies, type CaseStudy } from "../data";

export function AgencyPortfolio() {
  const [active, setActive] = useState<CaseStudy | null>(null);

  return (
    <section id="proiecte" className="px-5 py-24 sm:px-8" style={{ background: "var(--a-bg)" }}>
      <div className="mx-auto max-w-6xl">
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

        <div className="mt-14 grid gap-1 sm:grid-cols-2">
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

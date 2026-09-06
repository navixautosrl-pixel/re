import { Car, Wind, Armchair, Layers, ShieldCheck, Sun } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { services } from "@/lib/constants";

const icons = [Car, Wind, Armchair, Layers, ShieldCheck, Sun];
// Each service gets its own color from the urban palette instead of one
// muted brand tone repeated six times — a colored-rim-per-car kind of look.
const colors = ["#e11d2e", "#22d3ee", "#f0399e", "#fb923c", "#22d3ee", "#fb923c"];

export function Services() {
  return (
    <section id="servicii" className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-accent">01 — Servicii</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Tot ce are nevoie mașina ta, într-un singur loc
          </h2>
        </Reveal>

        <div className="mt-14 border-t border-border">
          {services.map((s, i) => {
            const Icon = icons[i];
            const color = colors[i];
            return (
              <Reveal key={s.name} delay={i * 0.04}>
                <div className="group grid grid-cols-[2.5rem_1fr] items-start gap-5 border-b border-border py-6 transition-colors hover:bg-surface sm:grid-cols-[3.5rem_auto_1fr] sm:items-center sm:gap-8 sm:px-4">
                  <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors sm:flex"
                    style={{ color, borderColor: `color-mix(in srgb, ${color} 35%, var(--color-border))` }}
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="col-span-2 sm:col-span-1">
                    <h3 className="flex items-center gap-2 text-base font-medium sm:text-lg">
                      <Icon className="h-4 w-4 sm:hidden" style={{ color }} aria-hidden="true" />
                      {s.name}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Prețul depinde de mărimea și starea mașinii — sună pentru o ofertă exactă.
        </p>
      </div>
    </section>
  );
}

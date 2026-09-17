import { Flame, Dumbbell, Swords, Zap, HeartPulse, Wind, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { classes } from "../data";

const icons: LucideIcon[] = [Flame, Dumbbell, Swords, Zap, HeartPulse, Wind];

export function FitnessClasses() {
  return (
    <section id="clase" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--f-surface)" }}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--f-accent)" }}>
            Clase
          </p>
          <h2 className="font-fitness mt-3 text-4xl uppercase text-[var(--f-fg)] sm:text-5xl">Alege-ți antrenamentul</h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={cls.id} delay={i * 0.06}>
                <div
                  className="group h-full rounded-md border p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ borderColor: "var(--f-border)", background: "var(--f-surface-2)" }}
                >
                  <div
                    className="flex size-11 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-110"
                    style={{ background: "color-mix(in srgb, var(--f-accent) 16%, transparent)" }}
                  >
                    <Icon className="size-5" style={{ color: "var(--f-accent)" }} aria-hidden="true" />
                  </div>
                  <h3 className="font-fitness mt-5 text-xl uppercase text-[var(--f-fg)]">{cls.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--f-muted)" }}>
                    {cls.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/shared/Reveal";
import { trainers } from "../data";

export function FitnessTrainers() {
  return (
    <section id="antrenori" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--f-surface)" }}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--f-accent)" }}>
            Antrenori
          </p>
          <h2 className="font-fitness mt-3 text-4xl uppercase text-[var(--f-fg)] sm:text-5xl">Echipa FORGE</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((trainer, i) => (
            <Reveal key={trainer.id} delay={i * 0.07}>
              <div className="group overflow-hidden rounded-md border" style={{ borderColor: "var(--f-border)", background: "var(--f-surface-2)" }}>
                <div
                  className="flex aspect-square items-center justify-center text-5xl font-black transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background: i % 2 === 0 ? "linear-gradient(135deg, var(--f-accent), transparent)" : "linear-gradient(135deg, var(--f-accent-2), transparent)",
                    color: "#0a0a0a",
                  }}
                >
                  {trainer.initials}
                </div>
                <div className="p-4">
                  <h3 className="font-fitness text-lg uppercase text-[var(--f-fg)]">{trainer.name}</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--f-muted)" }}>
                    {trainer.specialty}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

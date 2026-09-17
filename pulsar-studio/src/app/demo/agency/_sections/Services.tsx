import { Reveal } from "@/components/shared/Reveal";
import { services } from "../data";

export function AgencyServices() {
  return (
    <section id="servicii" className="px-5 py-24 sm:px-8" style={{ background: "var(--a-surface)" }}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--a-accent-ink)" }}>
            Servicii
          </p>
          <h2 className="font-agency mt-4 text-4xl uppercase text-[var(--a-fg)] sm:text-5xl">Ce facem</h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.name} delay={i * 0.08} className="border-t pt-6" style={{ borderColor: "var(--a-border)" }}>
              <span className="font-agency text-sm" style={{ color: "var(--a-accent-ink)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-agency mt-3 text-2xl uppercase text-[var(--a-fg)]">{service.name}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--a-muted)" }}>
                {service.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/shared/Reveal";
import { services } from "@/lib/constants";

export function Services() {
  return (
    <section id="servicii" className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-accent">Servicii</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Tot ce are nevoie mașina ta, într-un singur loc
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.05}>
              <div className="h-full bg-background p-7">
                <h3 className="text-base font-medium">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Prețul depinde de mărimea și starea mașinii — sună pentru o ofertă exactă.
        </p>
      </div>
    </section>
  );
}

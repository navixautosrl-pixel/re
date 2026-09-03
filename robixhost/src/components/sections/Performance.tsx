import { Reveal } from "@/components/shared/Reveal";

const points = [
  {
    label: "Stocare",
    detail: "NVMe pe fiecare plan — nu doar pe cele premium.",
  },
  {
    label: "Rețea",
    detail: "Rutare optimizată pentru timp de răspuns constant.",
  },
  {
    label: "Arhitectură",
    detail: "Dimensionată pentru sarcini reale, nu teste sintetice.",
  },
];

export function Performance() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mb-6 flex items-center gap-3 font-mono-tech text-xs tracking-[0.08em] text-muted-foreground">
          <span className="text-accent">01</span>
          <span className="uppercase">Performanță</span>
        </div>
        <Reveal>
          <p className="max-w-4xl text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl">
            Viteza nu e un bullet point pe o pagină de prețuri — e arhitectura pe care
            construim fiecare plan, de la primul leu la ultimul.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 border-t border-border pt-10 sm:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.08}>
              <p className="font-mono-tech text-xs uppercase tracking-[0.08em] text-accent">{p.label}</p>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{p.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

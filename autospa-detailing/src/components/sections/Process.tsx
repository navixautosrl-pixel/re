import { Reveal } from "@/components/shared/Reveal";

const steps = [
  {
    title: "Suni sau ne scrii",
    description: "Ne spui ce are nevoie mașina ta — o spălare rapidă sau un detailing complet.",
  },
  {
    title: "Evaluăm mașina",
    description: "Ne uităm la vopsea, tapițerie și starea generală înainte să începem, nu ghicim din mers.",
  },
  {
    title: "Lucrăm cu răbdare",
    description: "Fiecare etapă se face manual, fără grabă — de-asta ies curate mașinile care intră aici.",
  },
  {
    title: "Ridici mașina gata",
    description: "Verificăm împreună rezultatul înainte să pleci — dacă ceva nu e ok, îl reluăm.",
  },
];

export function Process() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-accent">02 — Cum lucrăm</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Fără grabă, fără scurtături
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <div className="relative pl-0">
                <span className="font-display-caps block text-4xl text-border-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

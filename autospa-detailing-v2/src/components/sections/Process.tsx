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
          <p className="font-display-caps text-sm tracking-[0.05em] text-accent">Cum lucrăm</p>
          <h2 className="font-display-caps mt-3 max-w-xl text-4xl leading-[0.95] sm:text-5xl">
            Fără grabă, fără scurtături
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.05}>
              <div className="grid grid-cols-[1fr_auto] items-center gap-6 border-t border-border py-8 last:border-b sm:grid-cols-[5rem_1fr_18rem]">
                <span className="font-display-caps text-3xl text-border-strong sm:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="order-3 col-span-2 sm:order-2 sm:col-span-1">
                  <h3 className="font-display-caps text-2xl leading-tight">{step.title}</h3>
                </div>
                <p className="order-2 col-span-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:order-3 sm:col-span-1">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

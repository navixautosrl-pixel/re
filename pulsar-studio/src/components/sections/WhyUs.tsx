import { Palette, Code2, Smartphone, Search, Gauge, LifeBuoy, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { whyUs } from "@/lib/constants";

const icons: LucideIcon[] = [Palette, Code2, Smartphone, Search, Gauge, LifeBuoy];

export function WhyUs() {
  return (
    <section className="section-y relative border-y border-border bg-surface">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Construit ca să funcționeze.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.map((item, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={item.title} delay={i * 0.06} className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-2/12">
                  <Icon className="size-5 text-accent-2" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

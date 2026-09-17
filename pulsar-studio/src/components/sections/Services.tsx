import { Globe, ShoppingCart, Search, Megaphone, Wrench, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { TiltCard } from "@/components/shared/TiltCard";
import { services } from "@/lib/constants";

const icons: LucideIcon[] = [Globe, ShoppingCart, Search, Megaphone, Wrench];
const glows = ["accent", "accent-2", "accent-3", "accent-4", "accent-2"] as const;

export function Services() {
  return (
    <section id="servicii" className="section-y relative">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Ce putem face <span className="gradient-text">pentru tine?</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = icons[i];
            const glow = glows[i];
            return (
              <Reveal key={service.index} delay={i * 0.08} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}>
                <TiltCard className="group flex h-full flex-col p-7" style={{ ["--glow" as string]: `var(--color-${glow})` }}>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex size-12 items-center justify-center rounded-md"
                      style={{ background: `color-mix(in srgb, var(--color-${glow}) 18%, transparent)` }}
                    >
                      <Icon className="size-5" style={{ color: `var(--color-${glow})` }} aria-hidden="true" />
                    </div>
                    <span className="font-display text-3xl font-semibold text-foreground/10">{service.index}</span>
                  </div>

                  <h3 className="font-display mt-6 text-xl font-semibold text-foreground">{service.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {service.points.slice(0, 4).map((point) => (
                      <li
                        key={point}
                        className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-muted-foreground"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="mt-auto inline-block w-fit pt-6 text-sm font-semibold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:text-accent-2 group-hover:decoration-current"
                  >
                    Discută acest serviciu
                  </a>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

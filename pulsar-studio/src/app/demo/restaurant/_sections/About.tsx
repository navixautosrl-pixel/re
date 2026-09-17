import { Flame, Leaf, Users } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const points = [
  { icon: Flame, title: "Gătit la jar", text: "Fiecare fel principal trece prin grătarul pe cărbune din bucătăria deschisă." },
  { icon: Leaf, title: "Ingrediente de sezon", text: "Meniul se schimbă odată cu anotimpurile și cu ce găsim proaspăt." },
  { icon: Users, title: "Spațiu intim", text: "O singură sală, puține mese — gândită pentru conversație, nu pentru volum." },
];

export function RestaurantAbout() {
  return (
    <section id="despre" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--r-surface)" }}>
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--r-accent)" }}>
            Despre Ember
          </p>
          <h2 className="font-restaurant mt-3 text-4xl text-[var(--r-fg)] sm:text-5xl">O bucătărie construită în jurul focului.</h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--r-muted)" }}>
            Ember a pornit de la o idee simplă: cele mai bune arome vin din tehnici vechi — jar, fum, timp. Bucătăria
            deschisă e gândită ca parte din experiență, nu ca decor, iar meniul rămâne scurt ca fiecare fel să
            primească atenția pe care o merită.
          </p>
        </Reveal>

        <div className="space-y-6">
          {points.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.1} className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--r-accent) 18%, transparent)" }}>
                <point.icon className="size-5" style={{ color: "var(--r-accent)" }} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-restaurant text-lg text-[var(--r-fg)]">{point.title}</h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--r-muted)" }}>
                  {point.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

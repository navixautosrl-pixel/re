import { Gauge, Image as ImageIcon, Code2, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";

const points = [
  {
    icon: Gauge,
    name: "Core Web Vitals",
    description: "Construim ținând cont de metricile reale de performanță pe care Google le folosește la clasare.",
  },
  {
    icon: ImageIcon,
    name: "Imagini optimizate",
    description: "Formate moderne, dimensiuni corecte și încărcare progresivă — fără fișiere uriașe nefolosite.",
  },
  {
    icon: Code2,
    name: "Cod eficient",
    description: "Arhitectură modernă, fără dependențe inutile — doar ce are efectiv nevoie proiectul.",
  },
  {
    icon: Smartphone,
    name: "Performanță mobilă",
    description: "Testăm și optimizăm pentru condițiile reale de pe mobil, nu doar pe conexiuni rapide de birou.",
  },
];

export function Performance() {
  return (
    <section className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <SectionHeading
          eyebrow="Performanță"
          title="Viteza nu este un detaliu. Este parte din experiență."
          description="Un website lent pierde vizitatori înainte să apuce să-i convingă. Performanța este parte din procesul de dezvoltare, nu o etapă de optimizare ulterioară."
          align="center"
        />

        <div className="mx-auto mt-16 grid max-w-4xl gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2">
          {points.map((point, i) => {
            const Icon = point.icon;
            return (
              <Reveal key={point.name} delay={i * 0.06}>
                <div className="h-full bg-surface p-8">
                  <Icon className="h-5 w-5 text-accent" aria-hidden="true" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-xl text-foreground">{point.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

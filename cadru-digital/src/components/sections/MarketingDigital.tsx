import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";

const capabilities = [
  { name: "Strategie", description: "Un plan clar, adaptat obiectivelor reale ale afacerii tale." },
  { name: "Reclame", description: "Campanii plătite construite în jurul intenției reale a audienței." },
  { name: "Generare lead-uri", description: "Formulare și pagini construite să transforme vizitatorii în contacte." },
  { name: "Remarketing", description: "Reconectare cu vizitatorii care nu au convertit din prima." },
  { name: "Analytics", description: "Date reale despre ce funcționează, nu presupuneri." },
  { name: "CRO", description: "Optimizare continuă a ratei de conversie pe baza comportamentului real." },
];

export function MarketingDigital() {
  return (
    <section className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <SectionHeading
          eyebrow="Marketing digital"
          title="Aducem oamenii potriviți către site-ul tău"
          description="Te ajutăm să atragi audiența potrivită, să generezi lead-uri calificate și să înțelegi ce funcționează, ca să scalezi exact acele acțiuni."
        />

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.05}>
              <div className="border-l-2 border-border pl-5 transition-colors hover:border-accent">
                <h3 className="font-display text-xl text-foreground">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

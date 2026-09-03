import { MapPin, ShieldHalf, ActivitySquare } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

const facts = [
  { icon: MapPin, title: "Locații", description: "Datacenter-uri și regiuni disponibile.", detail: "de confirmat" },
  { icon: ShieldHalf, title: "Redundanță", description: "Arhitectură de rețea și alimentare redundantă.", detail: "de confirmat" },
  { icon: ActivitySquare, title: "Monitorizare", description: "Monitorizare a infrastructurii și alertare.", detail: "de confirmat" },
];

export function ServerInfrastructure() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          index="05"
          eyebrow="Servere"
          title="Server rack-uri, rețea și redundanță"
          description="Structura de infrastructură e pregătită — locația exactă și nivelul de redundanță vor fi confirmate public odată stabilite."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3">
          {facts.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="h-full bg-background p-7">
                <f.icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
                <h3 className="mt-5 text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                <ConfigBadge className="mt-4">{f.detail}</ConfigBadge>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

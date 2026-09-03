import { MapPin, ShieldHalf, ActivitySquare } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

const infrastructureFacts = [
  {
    icon: MapPin,
    title: "Locații",
    description: "Datacenter-uri și regiuni disponibile.",
    detail: "CONFIG HERE — listă locații reale",
  },
  {
    icon: ShieldHalf,
    title: "Redundanță",
    description: "Arhitectură de rețea și alimentare redundantă.",
    detail: "CONFIG HERE — nivel de redundanță confirmat",
  },
  {
    icon: ActivitySquare,
    title: "Monitorizare",
    description: "Monitorizare a infrastructurii și alertare.",
    detail: "CONFIG HERE — SLA și praguri de alertă",
  },
];

export function ServerInfrastructure() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="INFRASTRUCTURĂ FIZICĂ"
            title="Server rack-uri, rețea și redundanță"
            description="Structura de infrastructură e pregătită — detaliile specifice de locație și redundanță urmează să fie confirmate de RobixHost."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {infrastructureFacts.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6">
                <f.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                <ConfigBadge className="mt-4 w-fit">{f.detail}</ConfigBadge>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ShieldCheck, ServerCog, Radio } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

const BLOCKED_PACKETS = [12, 22, 34, 55, 68, 80];
const PASSED_PACKETS = [18, 40, 62, 88];

export function DDoSProtection() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          index="03"
          eyebrow="Protecție"
          title="Traficul malițios nu ajunge la serverul tău"
          description="Filtrarea are loc la marginea rețelei — traficul legitim ajunge nemodificat, restul este oprit înainte."
        />

        <Reveal delay={0.12} className="mt-14">
          <div className="relative h-56 overflow-hidden rounded-lg border border-border sm:h-64">
            <div className="absolute inset-0 bg-grid opacity-[0.05]" aria-hidden="true" />

            <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 sm:left-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground">
                <Radio className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
              </div>
              <span className="font-mono-tech text-[10px] text-muted-foreground">TRAFIC</span>
            </div>

            <div className="absolute left-1/2 top-1/2 flex h-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
              </div>
              <span className="mt-1.5 font-mono-tech text-[10px] text-accent">FILTRU</span>
            </div>

            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 sm:right-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/40 text-accent">
                <ServerCog className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
              </div>
              <span className="font-mono-tech text-[10px] text-accent">SERVER PROTEJAT</span>
            </div>

            {BLOCKED_PACKETS.map((delay, i) => (
              <span
                key={`b-${i}`}
                className="absolute top-[30%] h-1.5 w-1.5 rounded-full bg-alert [animation:packet-blocked_3.2s_linear_infinite]"
                style={{ animationDelay: `-${delay / 20}s` }}
                aria-hidden="true"
              />
            ))}
            {PASSED_PACKETS.map((delay, i) => (
              <span
                key={`p-${i}`}
                className="absolute top-[68%] h-1.5 w-1.5 rounded-full bg-accent [animation:packet-pass_3.2s_linear_infinite]"
                style={{ animationDelay: `-${delay / 20}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-alert" /> trafic blocat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> trafic legitim
            </span>
            <ConfigBadge className="ml-auto">Vizualizare ilustrativă</ConfigBadge>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

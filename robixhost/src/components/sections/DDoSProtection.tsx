import { ShieldCheck, ServerCog, Radio } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

const BLOCKED_PACKETS = [12, 22, 34, 55, 68, 80];
const PASSED_PACKETS = [18, 40, 62, 88];

export function DDoSProtection() {
  return (
    <section className="border-b border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="SECURITATE"
            title="Traficul malițios nu ajunge la serverul tău"
            description="Filtrarea are loc la marginea rețelei — traficul legitim ajunge nemodificat, restul este oprit înainte."
          />
        </Reveal>

        <Reveal delay={0.12} className="mt-10">
          <div className="relative h-56 overflow-hidden rounded-lg border border-border bg-surface sm:h-64">
            <div className="absolute inset-0 bg-grid opacity-10" aria-hidden="true" />

            {/* Source */}
            <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 sm:left-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-elevated text-muted-foreground">
                <Radio className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-data text-[10px] text-muted-foreground">TRAFIC</span>
            </div>

            {/* Filter barrier */}
            <div className="absolute left-1/2 top-1/2 flex h-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/60 text-primary [animation:shield-pulse_2.4s_ease-in-out_infinite]"
              >
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="mt-1.5 font-data text-[10px] text-primary">FILTRU</span>
            </div>

            {/* Destination */}
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 sm:right-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/50 bg-surface-elevated text-primary">
                <ServerCog className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-data text-[10px] text-primary">SERVER PROTEJAT</span>
            </div>

            {/* Blocked (malicious) packets — stop at the filter line */}
            {BLOCKED_PACKETS.map((delay, i) => (
              <span
                key={`b-${i}`}
                className="absolute top-[30%] h-1.5 w-1.5 rounded-full bg-alert [animation:packet-blocked_3.2s_linear_infinite]"
                style={{ animationDelay: `-${delay / 20}s` }}
                aria-hidden="true"
              />
            ))}

            {/* Legitimate packets — pass through to the server */}
            {PASSED_PACKETS.map((delay, i) => (
              <span
                key={`p-${i}`}
                className="absolute top-[68%] h-1.5 w-1.5 rounded-full bg-primary [animation:packet-pass_3.2s_linear_infinite]"
                style={{ animationDelay: `-${delay / 20}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-alert" /> trafic blocat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> trafic legitim
            </span>
            <ConfigBadge className="ml-auto">Vizualizare ilustrativă — nu date live</ConfigBadge>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

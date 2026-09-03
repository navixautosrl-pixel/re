import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

export function Reviews() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading eyebrow="RECENZII" title="Ce spun clienții RobixHost" />
            <ConfigBadge>Testimoniale reale: în așteptare</ConfigBadge>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-lg border border-dashed border-border-strong bg-surface/50 p-6"
            >
              <Quote className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 text-sm text-muted-foreground">
                Acest loc este rezervat pentru o recenzie reală de la un client RobixHost. Nu
                afișăm testimoniale inventate.
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="h-9 w-9 rounded-full border border-border bg-surface-elevated" />
                <div>
                  <p className="text-xs font-medium text-foreground/80">Nume client — TODO</p>
                  <p className="text-xs text-muted-foreground">Companie — TODO</p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

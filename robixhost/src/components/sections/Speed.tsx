import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";

const comparison = [
  { label: "Stocare tradițională (HDD)", width: "38%" },
  { label: "Stocare NVMe RobixHost", width: "92%", highlight: true },
];

export function Speed() {
  return (
    <section className="border-b border-border bg-surface/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="PERFORMANȚĂ"
              title="Construit pentru viteză, de la disc la rețea"
              description="Stocare NVMe, rețea optimizată și configurare orientată pe timp de răspuns — nu doar specificații pe hârtie."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex flex-col gap-5">
                {comparison.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className={
                          row.highlight
                            ? "h-full rounded-full bg-primary"
                            : "h-full rounded-full bg-border-strong"
                        }
                        style={{ width: row.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <ConfigBadge className="mt-6">Ilustrativ — nu reprezintă un benchmark măsurat</ConfigBadge>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

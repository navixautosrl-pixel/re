import { ArrowDown } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";

const funnel = ["Website", "Vizibilitate", "Trafic", "Lead-uri", "Clienți", "Creștere"];

const pillars = [
  "SEO tehnic",
  "Cercetare cuvinte cheie",
  "Optimizare on-page",
  "Structură semantică",
  "SEO local",
  "Strategie de conținut",
  "Optimizare conversii",
  "Monitorizare & analiză",
];

export function SEO() {
  return (
    <section className="section-y border-b border-border bg-surface">
      <div className="container-max grid gap-16 px-6 lg:grid-cols-12 lg:gap-8 lg:px-10">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="SEO" title="Vizibilitatea nu e un accesoriu. E fundația." className="max-w-none" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Un website bun, pe care nimeni nu-l găsește, nu produce rezultate. Construim
              fundația tehnică și structura de conținut care fac diferența în Google.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {pillars.map((p) => (
                <span key={p} className="rounded-xs border border-border-strong px-3 py-1.5 text-xs text-muted-foreground">
                  {p}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col items-center lg:col-span-7 lg:justify-center">
          <div className="flex flex-col items-center">
            {funnel.map((step, i) => (
              <Reveal key={step} delay={i * 0.07} className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center rounded-sm border border-border-strong bg-background px-8 py-3.5 text-sm font-medium text-foreground"
                  style={{ width: `${260 - i * 24}px` }}
                >
                  {step}
                </div>
                {i < funnel.length - 1 ? (
                  <ArrowDown className="my-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

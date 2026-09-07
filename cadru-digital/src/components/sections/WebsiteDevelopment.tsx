import { Reveal } from "@/components/shared/Reveal";

const layers = [
  "Cercetare",
  "UX",
  "UI",
  "Dezvoltare",
  "Performanță",
  "SEO tehnic",
  "Analytics",
  "Optimizare conversii",
];

export function WebsiteDevelopment() {
  return (
    <section className="section-y border-b border-border bg-surface">
      <div className="container-max grid gap-14 px-6 lg:grid-cols-12 lg:gap-8 lg:px-10">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Website-uri, altfel</p>
            <h2 className="font-display mt-4 text-3xl leading-[1.1] text-foreground sm:text-4xl lg:text-[2.75rem]">
              Nu construim doar site-uri.
              <br />
              Construim instrumente pentru creșterea afacerii.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Fiecare proiect trece prin același proces disciplinat — de la înțelegerea afacerii
              tale, până la un website care performează tehnic și aduce rezultate reale, nu doar
              „arată bine".
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:pt-2">
          <div className="space-y-2">
            {layers.map((layer, i) => (
              <Reveal key={layer} delay={i * 0.05}>
                <div
                  className="flex items-center justify-between rounded-sm border border-border bg-background px-5 py-4 transition-colors hover:border-accent/40"
                  style={{ marginLeft: `${i * 1.1}%`, marginRight: `${i * 1.1}%` }}
                >
                  <span className="text-sm font-medium text-foreground">{layer}</span>
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

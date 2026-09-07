import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { MiniPreview } from "@/components/hero/MiniPreview";

const projects = [
  {
    name: "Structură — website de prezentare",
    category: "Website",
    objective: "Prezentare de servicii B2B cu accent pe claritate și generare de lead-uri.",
    tech: "Next.js · Tailwind CSS",
    accent: "var(--color-accent)",
  },
  {
    name: "Lansare — landing page produs",
    category: "Landing Page",
    objective: "O singură ofertă, un singur formular, un singur drum către conversie.",
    tech: "Next.js · Framer Motion",
    accent: "#8fb3a3",
  },
  {
    name: "Catalog — magazin online",
    category: "E-commerce",
    objective: "Structură de catalog și checkout simplificat pentru un magazin mic-mediu.",
    tech: "Next.js · Stripe",
    accent: "#b08a6a",
  },
];

export function Portfolio() {
  return (
    <section id="portofoliu" className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Portofoliu" title="Cum arată o structură bine construită" className="max-w-none" />
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm text-muted-foreground">
              Proiecte demonstrative care ilustrează abordarea noastră — vor fi înlocuite cu
              proiecte reale de client pe măsură ce le livrăm.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.name} delay={i * 0.08}>
              <a href="#contact" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border transition-colors group-hover:border-accent/40">
                  <div className="absolute right-3 top-3 z-10">
                    <span className="demo-tag">Proiect demo</span>
                  </div>
                  <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04]">
                    <MiniPreview accent={project.accent} />
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {project.category}
                    </p>
                    <h3 className="font-display mt-1 text-xl text-foreground">{project.name}</h3>
                  </div>
                  <ArrowUpRight
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.objective}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground/70">{project.tech}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

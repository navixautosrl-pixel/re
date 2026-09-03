import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ServicePackagesGrid } from "@/components/shared/ServicePackagesGrid";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { webDesignPackages } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Creare Website-uri la Cheie",
  description: "Website-uri la cheie — landing page, site de prezentare sau magazin online, livrate rapid. De la 1.490 RON.",
};

const process = [
  { step: "01", title: "Brief", description: "Discutăm obiectivul, structura și conținutul site-ului." },
  { step: "02", title: "Design", description: "Propunere vizuală personalizată pentru brandul tău." },
  { step: "03", title: "Dezvoltare", description: "Construim site-ul, optimizat pentru mobil și viteză." },
  { step: "04", title: "Livrare", description: "Site publicat, cu SEO on-page de bază inclus." },
];

export default function WebDesignPage() {
  return (
    <>
      <PageHeader
        eyebrow="Creare Website-uri"
        title="Website-ul tău, livrat la cheie"
        description="De la o pagină de landing la un magazin online complet — design personalizat, nu un șablon cu logo-ul schimbat."
      />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Proces" title="Cum lucrăm" align="center" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-4">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.06}>
                <div className="h-full bg-background p-7">
                  <span className="font-mono-tech text-xs text-accent">{p.step}</span>
                  <h3 className="mt-4 text-base font-medium">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Prețuri" title="Pachete website" align="center" />
          <div className="mt-14">
            <ServicePackagesGrid packages={webDesignPackages} />
          </div>
        </div>
      </section>

      <FAQSection />
      <FinalCTA />
    </>
  );
}

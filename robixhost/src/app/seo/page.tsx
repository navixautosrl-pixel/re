import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ServicePackagesGrid } from "@/components/shared/ServicePackagesGrid";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { seoPackages } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SEO — Optimizare pentru Motoare de Căutare",
  description: "Poziționare organică pe termen lung — audit tehnic, content SEO și link building. De la 890 RON/lună.",
};

const pillars = [
  { title: "Tehnic", description: "Viteză, structură, indexare — fundația fără de care restul nu contează." },
  { title: "Conținut", description: "Pagini și articole scrise pentru intenția reală de căutare, nu pentru algoritm." },
  { title: "Autoritate", description: "Link building controlat, orientat spre calitate, nu volum." },
];

export default function SeoPage() {
  return (
    <>
      <PageHeader
        eyebrow="SEO"
        title="Poziționare organică, construită să dureze"
        description="Audit tehnic, conținut optimizat și autoritate de domeniu — fără shortcut-uri care riscă penalizări."
      />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Abordare" title="Cele trei piloni ai SEO" align="center" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3">
            {pillars.map((p) => (
              <Reveal key={p.title}>
                <div className="h-full bg-background p-7">
                  <h3 className="text-base font-medium">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Prețuri" title="Pachete SEO" align="center" />
          <div className="mt-14">
            <ServicePackagesGrid packages={seoPackages} />
          </div>
        </div>
      </section>

      <FAQSection />
      <FinalCTA />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ServicePackagesGrid } from "@/components/shared/ServicePackagesGrid";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { digitalMarketingPackages } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Digital Marketing",
  description: "Campanii Meta Ads și Google Ads administrate de la strategie la raportare. De la 990 RON/lună.",
};

const channels = ["Meta Ads (Facebook & Instagram)", "Google Ads (Search & Display)", "TikTok Ads"];

export default function DigitalMarketingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Digital Marketing"
        title="Campanii care aduc clienți, nu doar afișări"
        description="Administrare de campanii plătite, de la targetare la optimizare continuă — raportate clar, lunar."
      />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Canale" title="Unde rulăm campanii" align="center" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3">
            {channels.map((c) => (
              <Reveal key={c}>
                <div className="bg-background p-7 text-center text-sm font-medium">{c}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Prețuri" title="Pachete digital marketing" align="center" />
          <div className="mt-14">
            <ServicePackagesGrid packages={digitalMarketingPackages} />
          </div>
        </div>
      </section>

      <FAQSection />
      <FinalCTA />
    </>
  );
}

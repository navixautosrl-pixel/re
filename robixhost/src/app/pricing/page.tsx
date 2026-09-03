import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FAQSection } from "@/components/sections/FAQSection";
import { hostingPlans, vpsPlans, gameServerPlans, dedicatedServerPlans } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Prețuri",
  description: "Planuri RobixHost pentru Web Hosting, VPS, Game Servers și Dedicated Servers — prețuri reale, fără costuri ascunse.",
};

const groups = [
  { title: "Web Hosting", plans: hostingPlans },
  { title: "VPS", plans: vpsPlans },
  { title: "Game Servers", plans: gameServerPlans },
  { title: "Dedicated Servers", plans: dedicatedServerPlans },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Prețuri"
        title="Un plan pentru fiecare etapă"
        description="Toate planurile includ protecție DDoS. Comanda finală se face din contul de client RobixHost."
      />

      {groups.map((group, i) => (
        <section key={group.title} className={i === groups.length - 1 ? "section-y" : "section-y border-b border-border"}>
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <SectionHeading title={group.title} align="center" />
            <div className="mt-12">
              <PlansGrid plans={group.plans} />
            </div>
          </div>
        </section>
      ))}

      <FAQSection />
    </>
  );
}

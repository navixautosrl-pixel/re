import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { FAQSection } from "@/components/sections/FAQSection";
import {
  hostingPlans,
  vpsPlans,
  gameServerPlans,
  dedicatedServerPlans,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Prețuri",
  description:
    "Planuri RobixHost pentru Web Hosting, VPS, Game Servers și Dedicated Servers. Structura e finală — prețurile exacte urmează să fie confirmate.",
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
        eyebrow="PREȚURI"
        title="Alege planul potrivit"
        description="Toate planurile includ protecție DDoS. Prețurile și specificațiile exacte urmează să fie confirmate de RobixHost."
      />

      {groups.map((group, i) => (
        <section
          key={group.title}
          className={
            i % 2 === 0
              ? "border-b border-border py-16 sm:py-20"
              : "border-b border-border bg-surface/30 py-16 sm:py-20"
          }
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <SectionHeading title={group.title} align="center" />
            </Reveal>
            <div className="mt-10">
              <PlansGrid plans={group.plans} />
            </div>
          </div>
        </section>
      ))}

      <FAQSection />
    </>
  );
}

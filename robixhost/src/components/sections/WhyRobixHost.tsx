import { SectionHeading } from "@/components/shared/SectionHeading";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { Reveal } from "@/components/shared/Reveal";
import { whyRobixHostFeatures } from "@/lib/constants";

export function WhyRobixHost() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="DE CE ROBIXHOST"
            title="Construit pentru continuitate, nu doar pentru demo"
            align="center"
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyRobixHostFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <FeatureCard icon={f.icon} title={f.title} description={f.description} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { FileCheck, Lock, Receipt, LifeBuoy } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";

/**
 * Real trust signals only — policies and mechanisms this site can
 * actually stand behind, not fabricated testimonials or client logos.
 * See CLAUDE.md: don't perform trust with content that doesn't exist.
 */
const pillars = [
  {
    icon: Lock,
    title: "Confidențialitate dintâi",
    description: "GDPR aplicat concret — cookie-uri opționale dezactivate implicit, IP-ul procesat, nu stocat.",
    href: "/privacy",
    linkLabel: "Politica de confidențialitate",
  },
  {
    icon: Receipt,
    title: "Prețuri fără costuri ascunse",
    description: "Ce vezi în pagina de prețuri e ce plătești — facturare transparentă în contul de client.",
    href: "/pricing",
    linkLabel: "Vezi prețurile",
  },
  {
    icon: FileCheck,
    title: "Politici clare, nu promisiuni vagi",
    description: "Termeni, SLA și politică de rambursare documentate — nu text de marketing.",
    href: "/sla",
    linkLabel: "Citește SLA-ul",
  },
  {
    icon: LifeBuoy,
    title: "Suport prin tichet, urmăribil",
    description: "Fiecare solicitare are un istoric în contul tău de client, nu doar un email pierdut.",
    href: "/support",
    linkLabel: "Centrul de suport",
  },
];

export function Trust() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading index="08" eyebrow="Încredere" title="Ce poți verifica singur, nu doar ce-ți spunem" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full bg-background p-7">
                <p.icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
                <h3 className="mt-5 text-base font-medium">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <Link
                  href={p.href}
                  className="mt-4 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
                >
                  {p.linkLabel}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Ticket, Mail, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { FAQSection } from "@/components/sections/FAQSection";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Suport",
  description: "Centru de suport RobixHost — FAQ, contact, status infrastructură și tichete.",
};

const channels = [
  {
    icon: Ticket,
    title: "Sistem de tichete",
    description: "Deschide un tichet pentru probleme tehnice sau facturare, cu istoric complet.",
    href: siteConfig.clientAreaUrl,
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: siteConfig.supportEmail,
    href: `mailto:${siteConfig.supportEmail}`,
  },
  {
    icon: Activity,
    title: "Status infrastructură",
    description: "Vezi disponibilitatea serviciilor RobixHost.",
    href: "/status",
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support Center"
        title="Cu ce te putem ajuta?"
        description="FAQ, contact și status infrastructură — totul într-un singur loc."
      />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal className="grid gap-4 sm:grid-cols-3">
            {channels.map((c) => {
              const Card = (
                <div className="flex h-full flex-col rounded-lg border border-border p-7 transition-colors hover:border-border-strong">
                  <c.icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
                  <h3 className="mt-5 text-base font-medium">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                </div>
              );
              return c.external ? (
                <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer">
                  {Card}
                </a>
              ) : (
                <Link key={c.title} href={c.href}>
                  {Card}
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 border-b border-border py-4 text-xs text-muted-foreground">
        <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
        Pentru urgențe de infrastructură, contactează suportul prin email.
      </div>

      <FAQSection />
    </>
  );
}

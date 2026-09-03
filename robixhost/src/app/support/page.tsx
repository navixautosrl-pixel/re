import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, MessageSquare, Mail, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { FAQSection } from "@/components/sections/FAQSection";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Suport",
  description: "Centru de suport RobixHost — FAQ, contact, status infrastructură și sistem de tickete.",
};

const channels = [
  {
    icon: MessageSquare,
    title: "Sistem de tickete",
    description: "Deschide un tichet pentru probleme tehnice sau facturare.",
    href: undefined,
    badge: "Ticket system: TODO integrare",
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
        eyebrow="SUPPORT CENTER"
        title="Cu ce te putem ajuta?"
        description="FAQ, contact și status infrastructură — totul într-un singur loc."
      />

      <section className="border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="grid gap-4 sm:grid-cols-3">
            {channels.map((c) => {
              const Card = (
                <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/50">
                  <c.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                  {c.badge ? <ConfigBadge className="mt-4 w-fit">{c.badge}</ConfigBadge> : null}
                </div>
              );
              return c.href ? (
                <Link key={c.title} href={c.href}>
                  {Card}
                </Link>
              ) : (
                <div key={c.title}>{Card}</div>
              );
            })}
          </Reveal>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 border-b border-border bg-surface/30 py-3 text-xs text-muted-foreground">
        <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
        Pentru urgențe de infrastructură, contactează suportul prin email.
      </div>

      <FAQSection />
    </>
  );
}

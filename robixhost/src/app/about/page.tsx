import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Shield, Zap, Headset } from "lucide-react";

export const metadata: Metadata = {
  title: "Despre noi",
  description: "Despre RobixHost — infrastructură de hosting pentru afaceri din România.",
};

const values = [
  {
    icon: Shield,
    title: "Infrastructură dintâi",
    description: "Deciziile tehnice pornesc de la stabilitate și securitate, nu de la ce e mai ieftin.",
  },
  {
    icon: Zap,
    title: "Performanță reală",
    description: "Măsurăm ce contează pentru un site sau o aplicație reală, nu doar cifre de marketing.",
  },
  {
    icon: Headset,
    title: "Suport care răspunde",
    description: "Un client cu o problemă vrea un răspuns, nu un formular. Construim suportul în jurul asta.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="DESPRE NOI"
        title="Infrastructură construită pentru afaceri reale"
        description="RobixHost oferă hosting, VPS, game servers și domenii pentru afaceri și proiecte din România."
      />

      <section className="border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title="Ce ne ghidează" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-lg border border-border bg-surface p-6">
                <v.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading title="Compania" align="center" />
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Istoricul companiei, anul înființării și datele juridice complete vor fi adăugate aici.
              </p>
              <ConfigBadge>Date companie: CONFIG HERE — vezi și footer/legal</ConfigBadge>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

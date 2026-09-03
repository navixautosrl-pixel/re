import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Shield, Zap, Headset } from "lucide-react";

export const metadata: Metadata = {
  title: "Despre noi",
  description: "Despre RobixHost — infrastructură de hosting și servicii digitale pentru afaceri din România.",
};

const values = [
  { icon: Shield, title: "Infrastructură dintâi", description: "Deciziile tehnice pornesc de la stabilitate și securitate, nu de la ce e mai ieftin." },
  { icon: Zap, title: "Performanță reală", description: "Măsurăm ce contează pentru un site sau o aplicație reală, nu doar cifre de marketing." },
  { icon: Headset, title: "Suport care răspunde", description: "Un client cu o problemă vrea un răspuns urmăribil, prin tichet — nu un email pierdut." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Despre noi"
        title="Infrastructură și servicii digitale, construite pentru afaceri reale"
        description="RobixHost oferă hosting, VPS, servere dedicate, game servers și domenii — plus creare de website-uri, digital marketing și SEO, pentru afaceri și proiecte din România."
      />

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading title="Ce ne ghidează" align="center" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="h-full bg-background p-7">
                <v.icon className="h-4 w-4 text-accent" aria-hidden="true" strokeWidth={1.5} />
                <h3 className="mt-5 text-base font-medium">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-y border-b border-border">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
          <Reveal>
            <SectionHeading title="Compania" align="center" />
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Istoricul companiei, anul înființării și datele juridice complete vor fi adăugate aici.
              </p>
              <ConfigBadge>Date companie — vezi și footer/legal</ConfigBadge>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { GameServers as GameServersGrid } from "@/components/sections/GameServers";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { gameServerPlans, productCategories } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Game Server Hosting Romania",
  description:
    "Servere de joc cu instalare rapidă și rețea optimizată pentru latență mică. Planuri Starter, Pro și Business.",
};

export default function GameServersPage() {
  const product = productCategories.find((p) => p.slug === "game-servers")!;

  return (
    <>
      <PageHeader
        eyebrow="GAME SERVERS"
        title="Servere de joc, pregătite pentru comunitatea ta"
        description={product.description}
      />

      <GameServersGrid />

      <section className="border-b border-border bg-surface/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="PLANURI" title="Planuri Game Servers" align="center" />
          </Reveal>
          <div className="mt-10">
            <PlansGrid plans={gameServerPlans} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

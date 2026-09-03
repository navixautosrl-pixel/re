import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { PlansGrid } from "@/components/shared/PlansGrid";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { GameServers as GameServersGrid } from "@/components/sections/GameServers";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { gameServerPlans } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Game Server Hosting Romania",
  description: "Servere de joc cu instalare rapidă și rețea optimizată pentru latență mică. De la 29 RON/lună.",
};

export default function GameServersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Game Servers"
        title="Servere de joc, pregătite pentru comunitatea ta"
        description="Instalare rapidă, sloturi nelimitate și infrastructură optimizată pentru trafic în timp real."
      />

      <GameServersGrid />

      <section className="section-y">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Prețuri" title="Planuri Game Servers" align="center" />
          </Reveal>
          <div className="mt-12">
            <PlansGrid plans={gameServerPlans} />
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

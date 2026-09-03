import { Gamepad2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { gameServerTitles } from "@/lib/constants";

export function GameServers() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          index="06"
          eyebrow="Game Servers"
          title="Infrastructură pentru comunități de gaming"
          description="Titlurile de mai jos sunt planificate pentru suport — disponibilitatea fiecăruia va fi confirmată înainte de lansare."
        />
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-4">
          {gameServerTitles.map((game, i) => (
            <Reveal key={game.name} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-3 bg-background p-7 text-center">
                <Gamepad2 className="h-5 w-5 text-accent" aria-hidden="true" strokeWidth={1.5} />
                <span className="text-sm font-medium">{game.name}</span>
                <ConfigBadge>{game.confirmed ? "Disponibil" : "De confirmat"}</ConfigBadge>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

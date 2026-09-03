import { Gamepad2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { ConfigBadge } from "@/components/shared/ConfigBadge";
import { gameServerTitles } from "@/lib/constants";

export function GameServers() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="GAME SERVERS"
            title="Infrastructură pentru comunități de gaming"
            description="Titlurile de mai jos sunt planificate pentru suport — disponibilitatea fiecăruia va fi confirmată înainte de lansare."
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gameServerTitles.map((game, i) => (
            <Reveal key={game.name} delay={i * 0.06}>
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-elevated text-primary">
                  <Gamepad2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="font-display text-sm font-semibold">{game.name}</span>
                <ConfigBadge>{game.confirmed ? "Disponibil" : "De confirmat"}</ConfigBadge>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

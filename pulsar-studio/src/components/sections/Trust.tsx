import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { siteConfig } from "@/lib/constants";

export function Trust() {
  return (
    <section className="relative border-y border-border bg-surface py-10">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <Reveal>
          <a
            href={siteConfig.robixHostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glow-border group flex flex-col items-start justify-between gap-4 rounded-lg p-6 sm:flex-row sm:items-center sm:p-7"
          >
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[image:var(--gradient-blue-cyan)] font-display text-lg font-bold text-background">
                R
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">Partener oficial</p>
                <p className="font-display text-lg font-semibold text-foreground">RobixHost.ro</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Găzduim și lansăm proiectele prin infrastructura RobixHost — hosting rapid, configurat corect de la
              lansare.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-transform duration-300 group-hover:translate-x-1">
              Vezi RobixHost.ro
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

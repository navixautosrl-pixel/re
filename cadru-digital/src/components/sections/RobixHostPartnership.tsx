import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Spotlight } from "@/components/shared/Spotlight";
import { siteConfig } from "@/lib/constants";

const chain = ["Design", "Dezvoltare", "Hosting", "Performanță", "Mentenanță"];

export function RobixHostPartnership() {
  return (
    <section className="section-y border-b border-border">
      <div className="container-max px-6 lg:px-10">
        <Spotlight className="rounded-lg border border-border-strong bg-surface p-8 sm:p-12 lg:p-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Parteneriat</p>
            <h2 className="font-display mt-4 max-w-xl text-3xl leading-[1.1] text-foreground sm:text-4xl">
              Construim pentru performanță.
              <br />
              Găzduim pentru performanță.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Suntem parteneri{" "}
              <a
                href={siteConfig.robixHostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-accent"
              >
                RobixHost
              </a>{" "}
              pentru găzduire — astfel încât website-ul pe care îl construim rulează pe o
              infrastructură pe care o cunoaștem și în care avem încredere, nu la întâmplare.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {chain.map((item, i) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="rounded-sm border border-border-strong bg-background px-4 py-2 text-sm font-medium text-foreground">
                    {item}
                  </span>
                  {i < chain.length - 1 ? <span className="text-muted-foreground">+</span> : null}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <a
              href={siteConfig.robixHostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
            >
              Vezi RobixHost
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Reveal>
        </Spotlight>
      </div>
    </section>
  );
}

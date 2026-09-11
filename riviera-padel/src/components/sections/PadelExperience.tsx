import { Reveal } from "@/components/shared/Reveal";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants";

export function PadelExperience() {
  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <section id="padel" className="relative overflow-hidden bg-background section-y">
      <div className="container-max grid gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-10">
        <div className="lg:col-span-5 lg:pt-12">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-accent">01</span>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Sportul principal
              </p>
            </div>
            <h2 className="font-display mt-4 text-6xl uppercase leading-[0.9] tracking-[-0.01em] text-foreground sm:text-7xl">
              Nu doar
              <br />
              joci. Intri
              <br />
              în joc.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Padelul e rapid, social și extrem de ușor de învățat — de-asta a devenit sportul din care
              nimeni nu vrea să plece după primul meci. La Riviera, padelul este experiența din jurul
              căreia construim tot restul: lounge-ul, atmosfera, oamenii.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href={bookingHref} variant="primary">
                Rezervă un teren
              </Button>
              <Button href="#facilitati" variant="ghost" icon={false}>
                Vezi restul facilităților
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.1} className="relative">
            <MediaPlaceholder
              variant="padel"
              tag="Fotografie teren — în curând"
              className="aspect-[4/5] w-full rounded-sm sm:aspect-[16/11]"
            />
            <div className="absolute -bottom-6 -left-4 hidden rounded-sm border border-border-strong bg-background px-6 py-4 sm:left-8 sm:block">
              <p className="font-display text-2xl uppercase leading-none text-foreground">Padel</p>
              <p className="font-mono mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                Experiența Riviera
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

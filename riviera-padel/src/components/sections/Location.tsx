import { MapPin, Phone, Clock } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants";

export function Location() {
  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <section id="locatie" className="bg-background section-y">
      <div className="container-max grid gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-6 lg:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Locație</p>
          <h2 className="font-display mt-4 text-5xl uppercase leading-[0.92] tracking-[-0.01em] text-foreground sm:text-6xl">
            Găsește-ne
            <br />
            în București.
          </h2>

          <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8">
            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-base text-foreground">{siteConfig.addressLine1}</p>
                <p className="text-sm text-muted-foreground">{siteConfig.addressLine2}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <a href={siteConfig.phoneHref} className="text-base text-foreground transition-colors hover:text-accent">
                {siteConfig.phoneDisplay}
              </a>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-base text-foreground">
                Deschis de la {siteConfig.openingFrom}
                <span className="block text-sm text-muted-foreground">
                  Pentru program complet, sună-ne direct.
                </span>
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={siteConfig.mapsDirectionsUrl} variant="primary" external icon={false}>
              Indicații de orientare
            </Button>
            <Button href={siteConfig.phoneHref} variant="outline" icon={false}>
              Sună acum
            </Button>
          </div>
          <div className="mt-4">
            <Button href={bookingHref} variant="ghost">
              Rezervă un teren
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="aspect-[4/3] overflow-hidden rounded-sm border border-border sm:aspect-square lg:aspect-[4/5]">
            <iframe
              src={siteConfig.mapsEmbedUrl}
              title={`Hartă — ${siteConfig.fullName}, ${siteConfig.addressLine1}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full grayscale invert-[0.92] contrast-[0.9]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

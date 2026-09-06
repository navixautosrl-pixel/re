import { Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { siteConfig } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden border-b border-border">
      <div className="photo-slot ken-burns absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />

      <div className="relative mx-auto w-full max-w-[1300px] px-6 pb-14 pt-32 sm:pb-20 lg:px-10">
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          <Star className="h-4 w-4 fill-accent" aria-hidden="true" />
          {siteConfig.rating.toFixed(1)} · {siteConfig.reviewCount} recenzii Google
        </div>

        <TextReveal
          as="h1"
          delayStart={0.1}
          lines={["MAȘINA TA,", "CA NOUĂ."]}
          className="font-display-caps mt-5 text-[4rem] leading-[0.9] sm:text-[6.5rem] lg:text-[8.5rem]"
        />

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Spălătorie auto și detailing profesional în {siteConfig.locality} — exterior, interior,
            tapițerie și protecție lac, făcute cu răbdare, nu în grabă.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button asChild size="lg">
                <a href={siteConfig.phoneHref}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Sună acum — {siteConfig.phone}
                </a>
              </Button>
            </MagneticButton>
            <Button asChild size="lg" variant="outline">
              <a href="#servicii">Vezi serviciile</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

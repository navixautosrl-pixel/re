import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { siteConfig } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="photo-slot absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 bg-background/75" aria-hidden="true" />
      <div className="relative mx-auto max-w-xl px-6 text-center lg:px-10">
        <h2 className="font-display-caps text-5xl leading-[0.9] sm:text-6xl">Rezervă-ți locul</h2>
        <p className="mt-5 text-muted-foreground">
          Un telefon și mașina ta iese de aici arătând ca nouă.
        </p>
        <div className="mt-9 flex justify-center">
          <MagneticButton>
            <Button asChild size="lg">
              <a href={siteConfig.phoneHref}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {siteConfig.phone}
              </a>
            </Button>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

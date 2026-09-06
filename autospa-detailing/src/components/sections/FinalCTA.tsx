import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { siteConfig } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-[0.05]" aria-hidden="true" />
      <div className="relative mx-auto max-w-xl px-6 text-center lg:px-10">
        <h2 className="text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">Rezervă-ți locul</h2>
        <p className="mt-5 text-muted-foreground">
          Un telefon și mașina ta iese de aici arătând ca nouă.
        </p>
        <div className="mt-9">
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

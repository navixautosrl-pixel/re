import { Reveal } from "@/components/shared/Reveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants";

export function FinalCTA() {
  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <section className="relative overflow-hidden bg-background py-28 sm:py-40">
      <div className="court-glow" />
      <div className="container-max relative z-10 px-5 text-center sm:px-8 lg:px-10">
        <Reveal>
          <h2 className="font-display text-[15vw] uppercase leading-[0.88] tracking-[-0.01em] text-foreground sm:text-8xl lg:text-9xl">
            Ne vedem
            <br />
            la Riviera.
          </h2>
          <div className="mt-12 flex justify-center">
            <MagneticButton>
              <Button href={bookingHref} variant="primary" size="lg">
                Rezervă un teren
              </Button>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

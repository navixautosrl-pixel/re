import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { siteConfig } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="gradient-mesh" aria-hidden="true" />
      <div className="grid-field absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="container-max relative px-5 text-center sm:px-8 lg:px-10">
        <Reveal>
          <h2 className="font-display mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
            Hai să construim <span className="gradient-text">ceva care merită văzut.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Spune-ne ce ai în minte. Noi ne ocupăm să-l transformăm într-o experiență digitală.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton>
            <Button href="#contact" variant="primary" size="lg">
              Cere o ofertă
            </Button>
          </MagneticButton>
          <Button href={`mailto:${siteConfig.email}`} variant="outline" size="lg" icon={false} className="rounded-full" external>
            Vorbește cu noi
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

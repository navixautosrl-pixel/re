import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { SignalField } from "@/components/shared/SignalField";
import { siteConfig } from "@/lib/constants";

/**
 * The page's closing statement — deliberately the loudest block after the
 * hero, and the only other place the gradient headline treatment appears, so
 * the two bookend the page instead of the effect repeating in every section.
 */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      <div className="gradient-mesh" aria-hidden="true" />
      <div className="grid-field absolute inset-0 opacity-40" aria-hidden="true" />

      {/* The hero's motif returns, centred and quieter — a visual rhyme that
          closes the loop rather than a new decoration. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[135vw] -translate-x-1/2 -translate-y-1/2 opacity-40 sm:w-[80vw] lg:w-[58vw]"
        aria-hidden="true"
      >
        <SignalField />
      </div>

      <div className="noise-overlay" aria-hidden="true" />

      <div className="container-max relative z-10 px-5 text-center sm:px-8 lg:px-10">
        <Reveal>
          <h2
            className="font-display mx-auto max-w-5xl font-semibold uppercase leading-[0.95] tracking-[-0.035em] text-foreground"
            style={{ fontSize: "clamp(2.25rem, 6.4vw, 5.5rem)" }}
          >
            Hai să construim <span className="gradient-text">ceva care merită văzut.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
            Spune-ne ce ai în minte. Noi ne ocupăm să-l transformăm într-o experiență digitală.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton>
            <Button href="#contact" variant="primary" size="lg">
              Cere o ofertă
            </Button>
          </MagneticButton>
          <Button
            href={`mailto:${siteConfig.email}`}
            variant="outline"
            size="lg"
            icon={false}
            className="rounded-full"
            external
          >
            Vorbește cu noi
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

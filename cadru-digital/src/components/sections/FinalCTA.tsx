import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Reveal } from "@/components/shared/Reveal";
import { AuroraBackground } from "@/components/shared/AuroraBackground";

export function FinalCTA() {
  return (
    <section className="clip-diagonal-ribbon relative -my-16 overflow-hidden bg-surface py-32 sm:py-44">
      <AuroraBackground className="opacity-80" />
      <div className="container-max relative px-6 text-center lg:px-10">
        <Reveal>
          <h2 className="font-display mx-auto max-w-2xl text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Ai un proiect <span className="gradient-text">în minte?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Spune-ne ce vrei să construiești. Îți vom arăta cum îl putem transforma într-o
            experiență digitală care arată excelent și performează.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <Button asChild size="lg">
                <a href="#contact">
                  Discută proiectul tău
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </MagneticButton>
            <Button asChild size="lg" variant="ghost">
              <a href="#servicii">Vezi serviciile</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

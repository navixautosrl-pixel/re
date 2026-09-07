import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/shared/TextReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Reveal } from "@/components/shared/Reveal";
import { BrowserMockup } from "@/components/hero/BrowserMockup";

const trustIndicators = ["Design personalizat", "Performanță ridicată", "SEO-ready", "Mobile-first"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="bg-grid absolute inset-0 opacity-[0.04]" aria-hidden="true" />
      <div className="container-max relative grid gap-16 px-6 pb-20 pt-16 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-32 lg:pt-24">
        <div className="lg:col-span-6 lg:pt-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Agenție digitală premium</p>
          </Reveal>

          <TextReveal
            as="h1"
            delayStart={0.1}
            lines={["Website-uri care", "transformă atenția", "în rezultate."]}
            className="font-display mt-5 text-[2.75rem] leading-[1.03] tracking-[-0.02em] text-foreground sm:text-6xl lg:text-[3.75rem]"
          />

          <Reveal delay={0.55}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Construim website-uri, magazine online și landing page-uri rapide, optimizate pentru
              motoarele de căutare și gândite să transforme vizitatorii în clienți.
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton>
                <Button asChild size="lg">
                  <a href="#contact">
                    Începe un proiect
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </MagneticButton>
              <Button asChild size="lg" variant="ghost">
                <a href="#servicii">
                  Vezi ce facem
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.75}>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6">
              {trustIndicators.map((item) => (
                <span key={item} className="text-sm text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:pt-4">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

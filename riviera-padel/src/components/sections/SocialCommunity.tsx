import { Reveal } from "@/components/shared/Reveal";
import { SiteImage } from "@/components/shared/SiteImage";

export function SocialCommunity() {
  return (
    <section className="relative overflow-hidden bg-background section-y">
      <div className="container-max px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-6">
          <div className="lg:col-span-5 lg:order-2">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Social</p>
              <h2 className="font-display mt-4 text-5xl uppercase leading-[0.92] tracking-[-0.01em] text-foreground sm:text-6xl">
                Mai mult
                <br />
                decât un meci.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                Vii pentru joc, rămâi pentru oameni. Riviera adună prieteni vechi, parteneri de
                joc noi și pe oricine vrea să-și petreacă seara altfel decât de obicei — competiție,
                energie și conversații care continuă mult după ultimul punct.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:order-1">
            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                <SiteImage
                  src="/images/riviera-court-wide.webp"
                  alt="Terenurile de padel Riviera, în lumina zilei"
                  className="col-span-2 aspect-[16/9] rounded-sm"
                  objectPosition="center 40%"
                />
                <SiteImage src="/images/riviera-bar-2.webp" alt="Barul Riviera" className="aspect-square rounded-sm" />
                <SiteImage
                  src="/images/riviera-bar-1.webp"
                  alt="Zona de bar din lounge-ul Riviera"
                  className="aspect-square rounded-sm"
                  objectPosition="center 30%"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

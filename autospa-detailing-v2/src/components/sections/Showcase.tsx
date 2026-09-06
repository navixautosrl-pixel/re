import { Reveal } from "@/components/shared/Reveal";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";

export function Showcase() {
  return (
    <section className="section-y border-b border-border bg-surface">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="font-display-caps text-sm tracking-[0.05em] text-accent">Rezultatul</p>
            <h2 className="font-display-caps mt-3 text-4xl leading-[0.95] sm:text-5xl">
              Trage linia. Vezi diferența.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
              Așa arată o mașină înainte și după un detailing complet — vopsea, jante și interior
              readuse la un aspect de showroom.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <BeforeAfterSlider />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

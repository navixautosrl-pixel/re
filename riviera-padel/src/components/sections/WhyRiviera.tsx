import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { whyRiviera } from "@/lib/constants";

// Cycled per row so the four pillars read as distinct, not identical
// cards in disguise — same trick as MediaPlaceholder's per-activity tint.
const colors = ["var(--color-accent)", "var(--color-accent-2)", "var(--color-accent-3)", "var(--color-accent)"];

export function WhyRiviera() {
  return (
    <section id="riviera" className="clip-diagonal relative overflow-hidden bg-surface pt-24 pb-32 sm:pt-32 sm:pb-40">
      <div className="court-glow opacity-50" />
      <div className="container-max relative px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="De ce Riviera" title="Patru motive. Un singur loc." className="mb-16 lg:mb-24" />

        <div className="border-t border-border">
          {whyRiviera.map((item, i) => {
            const color = colors[i % colors.length];
            return (
              <Reveal key={item.index} delay={i * 0.06}>
                <div
                  className="group grid items-center gap-4 border-b border-border py-8 transition-all duration-300 ease-[var(--ease-premium)] sm:grid-cols-12 sm:gap-8 sm:py-10 lg:py-12 sm:hover:pl-4 sm:hover:pr-0"
                  style={{ "--row-color": color } as React.CSSProperties}
                >
                  <span
                    className="font-mono text-sm transition-colors sm:col-span-1"
                    style={{ color }}
                  >
                    {item.index}
                  </span>
                  <h3 className="font-display text-4xl uppercase leading-none tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:[color:var(--row-color)] sm:col-span-4 sm:text-5xl">
                    {item.name}
                  </h3>
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:col-span-7">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

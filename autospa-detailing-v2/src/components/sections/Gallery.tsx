import { Reveal } from "@/components/shared/Reveal";

const tiles = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
];

export function Gallery() {
  return (
    <section className="section-y border-b border-border">
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <Reveal>
          <p className="font-display-caps text-sm tracking-[0.05em] text-accent">Galerie</p>
          <h2 className="font-display-caps mt-3 max-w-xl text-4xl leading-[0.95] sm:text-5xl">
            Muncă recentă
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {tiles.map((ratio, i) => (
            <Reveal key={i} delay={i * 0.04} className={i === 1 ? "col-span-2 lg:col-span-1" : ""}>
              <div className={`group relative overflow-hidden rounded-lg border border-border ${ratio}`}>
                <div className="photo-slot absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06]" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

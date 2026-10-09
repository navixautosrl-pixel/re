import Link from "next/link";
import { products, RANGES, type Range } from "@/data/products";
import { FAQ } from "@/data/faq";
import { Hero } from "@/components/Hero";
import { RangeStory } from "@/components/RangeStory";
import { BaitGuide } from "@/components/BaitGuide";
import { FactsTable } from "@/components/FactsTable";
import { FaqList } from "@/components/Faq";
import { ProductCard } from "@/components/ProductCard";
import { BagImage } from "@/components/Picture";
import { Reveal } from "@/components/Reveal";
import { pageMeta } from "@/lib/seo";

/*
 * MOTION STORYBOARD (home)
 * 1 Initial load  — no loader. Hero photo + text are in the HTML; fonts preloaded ("optional" for display).
 * 2 Hero          — PRIMARY: headline lines rise from masks (1s, 90ms stagger), photo settles 1.07→1 (1.6s),
 *                   lead fades in at 350ms. CSS only, so it never waits for JS. CTAs never hidden.
 * 3 Type reveals  — headline masks in the hero only; no per-word animation on body copy.
 * 4 Scroll        — PRIMARY: RangeStory pins on ≥900px (photo window → full bleed, facts step in, scrub 0.6).
 *                   Nothing else pins or parallaxes.
 * 5 Navigation    — header turns solid after the first pixel of scroll (IntersectionObserver), menu is a native dialog.
 * 6 Images        — clip-path open in RangeStory; product bags lift 6px + tilt on hover.
 * 7 Hover/focus   — 150–300ms colour/underline transitions; focus rings in cyan everywhere; ripples behind bags (ambient).
 * 8 Sections      — SECONDARY: heads and grids fade/rise 24px (0.6s, ease-out, 60ms stagger in grids).
 * 9 Mobile        — no pinning, no hover-only meaning; reveals stay. Reduced motion: everything final, instantly.
 * Easing tokens: --ease-out (entrances) / --ease-inout; GSAP scrub uses linear + power3.out for facts.
 */

export const metadata = pageMeta({
  title: "Boilies pentru crap: Fishmeal și Birdfood | RbtFishPro",
  absolute: true,
  description:
    "Boilies RbtFishPro pentru pescuitul la crap: Fishmeal fără aromă, Fishmeal cu squid și prună, Birdfood Scopex și Birdfood Căpșună, în 20 sau 24 mm. Comandă online.",
  path: "/",
});

const CATEGORY_IMAGE: Record<Range, string> = { fishmeal: "boilies-fishmeal", birdfood: "boilies-birdfood-scopex" };

export default function Home() {
  return (
    <>
      <Hero />

      {/* The range */}
      <section id="gama" aria-labelledby="gama-title" className="wrap scroll-mt-20 py-24 md:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="gama-title" className="display text-[length:var(--step-4)]">Patru rețete, <br className="hidden sm:block" />două baze</h2>
            <p className="measure mt-4 text-[length:var(--step-1)] text-mist-2">Fiecare rețetă în 20 sau 24 mm.</p>
          </div>
          <Link href="/magazin" className="btn btn-ghost">Toate produsele</Link>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 60}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section aria-labelledby="baze-title" className="wrap pb-24 md:pb-32">
        <h2 id="baze-title" className="sr-only">Alege după bază</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(RANGES) as Range[]).map((r, i) => {
            const p = products.find((x) => x.slug === CATEGORY_IMAGE[r])!;
            const n = products.filter((x) => x.range === r).length;
            return (
              <Reveal key={r} delay={i * 80}>
                <Link
                  href={`/magazin?baza=${r}`}
                  className="group relative grid min-h-64 grid-cols-[1fr_auto] items-end overflow-hidden rounded-[var(--radius-panel)] bg-reed/50 p-7 transition-colors hover:bg-reed sm:p-9"
                >
                  <span>
                    <span className="display block text-[length:var(--step-3)]">{RANGES[r].label}</span>
                    <span className="mt-2 block max-w-[24ch] text-mist-2">{RANGES[r].blurb} {n} rețete.</span>
                    <span className="mt-5 inline-block font-semibold text-cyan underline-offset-4 group-hover:underline">Vezi rețetele {RANGES[r].label}</span>
                  </span>
                  <BagImage base={p.image.base} width={p.image.width} height={p.image.height} alt="" className="-mb-16 w-28 rotate-6 transition-transform duration-500 group-hover:rotate-2 sm:w-36" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <RangeStory />

      {/* Verified facts */}
      <section aria-labelledby="facts-title" className="wrap py-24 md:py-32">
        <Reveal>
          <h2 id="facts-title" className="display text-[length:var(--step-4)]">Ce scrie pe pungă</h2>
          <p className="measure mt-4 text-[length:var(--step-1)] text-mist-2">
            Doar ce declară ambalajul. Ce nu e trecut acolo, nu trecem nici aici.
          </p>
        </Reveal>
        <Reveal className="mt-10" delay={80}>
          <FactsTable />
        </Reveal>
      </section>

      {/* Guide */}
      <section id="ghid" aria-labelledby="ghid-title" className="scroll-mt-20 border-y border-white/10 bg-[linear-gradient(to_bottom,var(--night),var(--night-2))] py-24 md:py-32">
        <div className="wrap">
          <Reveal>
            <h2 id="ghid-title" className="display text-[length:var(--step-4)]">Ce rețetă iei la apă?</h2>
            <p className="measure mt-4 mb-12 text-[length:var(--step-1)] text-mist-2">Temperatura apei schimbă cât și ce mănâncă crapul. Alege intervalul de azi.</p>
          </Reveal>
          <BaitGuide />
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="wrap grid gap-10 py-24 md:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <Reveal>
          <h2 id="faq-title" className="display text-[length:var(--step-4)]">Întrebări</h2>
          <p className="mt-4 text-mist-2">
            Restul răspunsurilor sunt pe <Link href="/intrebari-frecvente" className="link">pagina de întrebări frecvente</Link>.
          </p>
        </Reveal>
        <FaqList items={FAQ.filter((f) => f.home)} />
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-title" className="relative overflow-hidden border-t border-white/10 bg-night-2">
        <div className="wrap flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="cta-title" className="display text-[length:var(--step-3)]">Pregătește următoarea partidă</h2>
            <p className="mt-3 text-mist-2">Ai o întrebare despre o rețetă? <Link href="/contact" className="link">Scrie-ne</Link>.</p>
          </div>
          <Link href="/magazin" className="btn btn-primary">Descoperă boiliesurile</Link>
        </div>
      </section>
    </>
  );
}

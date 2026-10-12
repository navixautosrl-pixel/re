import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Suspense } from "react";
import { Calculator, CalculatorFromUrl } from "@/components/Calculator";
import { HowItWorks } from "@/components/HowItWorks";
import { RatesTable } from "@/components/RatesTable";
import { Reveal } from "@/components/Reveal";
import { CallButtons } from "@/components/CallButtons";
import { FaqList } from "@/data/faq";
import { pageMeta } from "@/lib/seo";
import { PRIMARY_ZONES } from "@/data/landings";
import { LandingCards } from "@/components/LandingCards";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/config/site";

/*
 * MOTION STORYBOARD
 * 1 Load        — no loader; hero text, buttons and truck are in the HTML. Font: display "optional".
 * 2 Hero        — PRIMARY: lines rise (0.8 s, 90 ms stagger); tow truck drives in (1.3 s, wheels spin,
 *                 ease-out) and parks; then ambient: centre line scrolls, beacon blinks. CSS only.
 * 3 Type        — only the hero staggers; no per-word effects.
 * 4 Scroll      — PRIMARY: "Cum funcționează" pins on ≥900 px; route A→B draws, a beacon dot rides it,
 *                 steps light up in turn (GSAP ScrollTrigger, scrub 0.5). Nothing else pins.
 * 5 Navigation  — header turns solid after scrolling; mobile menu is a native dialog; page changes
 *                 cross-fade/rise via React ViewTransition (180 ms out / 320 ms in).
 * 6 Calculator  — vehicle silhouette slides in (CSS, 0.35 s); total counts to the new value (0.5 s, rAF);
 *                 selected vehicle card lifts 2 px.
 * 7 Hover/focus — 150–250 ms colour/shadow; focus rings always visible.
 * 8 Sections    — SECONDARY: headings/blocks fade + rise 22 px once (0.6 s).
 * 9 Mobile      — no pinning, sticky call bar; reduced motion: everything static and final.
 */

export const metadata = pageMeta({
  title: "Tractări auto Chiajna, Militari, A1 și Centura București",
  absolute: true,
  description: "Tractări auto non-stop în Chiajna, Militari, pe A1 București–Pitești și pe Centura București. Calculezi online prețul pe km, înainte să suni.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />

      <section id="calculator" aria-label="Calculator preț tractare" className="scroll-mt-16 bg-[linear-gradient(to_bottom,var(--asphalt)_0_7rem,var(--concrete)_7rem)] pb-20">
        <div className="wrap -mt-px pt-10">
          <Suspense fallback={<Calculator />}>
            <CalculatorFromUrl />
          </Suspense>
        </div>
      </section>

      <HowItWorks />

      <section aria-labelledby="zone-title" className="wrap pt-20 md:pt-28">
        <Reveal>
          <h2 id="zone-title" className="text-[length:var(--step-3)]">Zonele noastre principale</h2>
          <p className="mt-3 max-w-[62ch] text-[length:var(--step-1)] text-ink-2">
            Chiajna, Militari, Autostrada A1 București–Pitești și Centura București — non-stop. Venim și în zonele din jur.
          </p>
        </Reveal>
        <div className="mt-8"><LandingCards slugs={PRIMARY_ZONES} /></div>
        <h3 className="mt-12 text-[length:var(--step-2)]">Și în zonele din jur</h3>
        <div className="mt-6">
          <LandingCards slugs={["tractari-dragomiresti-vale", "tractari-ciorogarla", "tractari-domnesti", "tractari-sector-6", "tractari-bragadiru", "tractari-ilfov", "tractari-sectoare-bucuresti", "tractari-otopeni"]} />
        </div>
        <p className="mt-6"><Link className="link font-[700]" href="/zone-deservite/">Toate zonele</Link></p>
      </section>

      <section aria-labelledby="serv-title" className="wrap pt-20">
        <Reveal>
          <h2 id="serv-title" className="text-[length:var(--step-3)]">Ce transportăm</h2>
          <p className="mt-3 max-w-[62ch] text-[length:var(--step-1)] text-ink-2">De la motociclete la autoutilitare de 7,5 tone, inclusiv mașini avariate cu roți blocate, în oraș sau în toată țara pe platformă.</p>
        </Reveal>
        <div className="mt-8"><LandingCards group="serviciu" /></div>
      </section>

      <section id="tarife" aria-labelledby="rates-title" className="wrap scroll-mt-20 py-20 md:py-28">
        <Reveal>
          <h2 id="rates-title" className="text-[length:var(--step-3)]">Tarife pe kilometru</h2>
          <p className="mt-3 max-w-[60ch] text-[length:var(--step-1)] text-ink-2">Aceleași tarife pe care le folosește calculatorul — nimic ascuns. Exemple calculate pe <Link href="/tarife-tractari/" className="link">pagina de tarife</Link>.</p>
        </Reveal>
        <Reveal className="mt-8" delay={80}><RatesTable /></Reveal>
      </section>

      <section aria-labelledby="faq-title" className="wrap grid gap-8 pb-20 md:pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]">
        <Reveal>
          <h2 id="faq-title" className="text-[length:var(--step-3)]">Întrebări frecvente</h2>
          <p className="mt-3 text-ink-2">Altă întrebare? <Link href="/contact/" className="link">Scrie-ne sau sună</Link>.</p>
        </Reveal>
        <FaqList />
      </section>

      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: "Tractări auto Chiajna, Militari, A1 și Centura București", description: "Tractări auto non-stop și transport pe platformă în Chiajna, Militari, pe A1 București–Pitești, pe Centura București și în zonele din jur, cu preț calculat online.", serviceType: "Tractări auto", url: `${site.url}/`, provider: { "@id": `${site.url}/#org` }, areaServed: ["Chiajna", "Militari", "Autostrada A1 București–Pitești", "Centura București", "București", "Ilfov"].map((name) => ({ "@type": "Place", name })) }} />

      <section aria-labelledby="cta-title" className="on-dark bg-sign text-white">
        <div className="wrap flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="cta-title" className="text-[length:var(--step-3)]">Ai rămas cu mașina pe drum?</h2>
            <p className="mt-2 text-white/85">Calculează prețul în 10 secunde sau sună direct.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/calculator/" className="btn bg-white text-sign hover:bg-concrete">Calculator preț</Link>
            <CallButtons />
          </div>
        </div>
      </section>
    </>
  );
}

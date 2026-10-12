import Link from "next/link";
import { site } from "@/config/site";
import { TowTruck } from "@/components/Vehicles";
import { CallButtons } from "@/components/CallButtons";
import { Placeholder } from "@/components/Placeholder";

/**
 * PRIMARY moment #1 (CSS only, runs before hydration): headline lines rise in sequence,
 * the tow truck drives in from the left with spinning wheels and parks; then ambient:
 * the centre line keeps scrolling and the beacon blinks. CTAs are visible from frame one.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-asphalt pt-28 text-paint md:pt-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_20%,color-mix(in_oklch,var(--sign)_35%,transparent),transparent_70%)]" />
      <div className="wrap rise">
        <p className="inline-flex items-center gap-2 rounded-full bg-asphalt-2 px-3 py-1 text-[length:var(--step--1)] font-[650] text-paint/85">
          <span aria-hidden="true" className="size-2 rounded-full bg-beacon" />
          {site.hours ?? <Placeholder field="hours">program (ex. non-stop)</Placeholder>}
          {" · "}
          {site.serviceArea ?? <Placeholder field="serviceArea">zona acoperită</Placeholder>}
        </p>
        <h1 id="hero-title" className="mt-5 max-w-[16ch] text-[length:var(--step-4)]">
          Tractări auto, cu prețul <span className="text-beacon">știut dinainte</span>
        </h1>
        <p className="mt-5 max-w-[46ch] text-[length:var(--step-1)] text-paint/85">
          Alegi vehiculul și traseul, vezi totalul în câteva secunde, apoi suni sau scrii pe WhatsApp cu prețul deja calculat.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="#calculator" className="btn btn-beacon min-h-14 px-6 text-[length:var(--step-1)]">Calculează prețul</Link>
          <CallButtons size="lg" quiet />
        </div>
      </div>

      <div className="relative mt-10 h-[clamp(9rem,22vw,15rem)]" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-asphalt-3" />
        <div className="lane absolute inset-x-0 bottom-[17%] h-1.5 opacity-80" />
        <div className="truck-in absolute bottom-[8%] left-[max(1rem,calc(50%-38rem))] w-[min(80vw,34rem)]">
          <TowTruck className="w-full drop-shadow-[0_18px_20px_rgba(0,0,0,.35)]" />
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { site } from "@/config/site";
import { TowTruck, VehicleArt } from "@/components/Vehicles";
import { CallButtons } from "@/components/CallButtons";
import { Placeholder } from "@/components/Placeholder";

/**
 * PRIMARY moment #1 (CSS only, runs before hydration): headline lines rise in sequence, the tow
 * truck drives in from the left, wheels rolling, and keeps "driving" with the road; ambient: lane
 * paint scrolls, the two beacons alternate, the headlight beam breathes, the city drifts, a car
 * passes in the far lane. CTAs are visible from frame one; all static under reduced motion.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-asphalt pt-28 text-paint md:pt-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_20%,color-mix(in_oklch,var(--sign)_35%,transparent),transparent_70%)]" />
      <div className="wrap rise">
        <p className="flex flex-wrap gap-2 text-[length:var(--step--1)] font-[650]">
          <span className="inline-flex items-center gap-2 rounded-full bg-beacon px-3 py-1 text-ink">
            <span aria-hidden="true" className="size-2 rounded-full bg-ink" />
            {site.hours ?? <Placeholder field="hours">program</Placeholder>}
          </span>
          <span className="inline-flex items-center rounded-full bg-asphalt-2 px-3 py-1 text-paint/85">
            {site.serviceArea ?? <Placeholder field="serviceArea">zona acoperită</Placeholder>}
          </span>
        </p>
        <h1 id="hero-title" className="mt-5 max-w-[20ch] text-[length:var(--step-4)]">
          Tractări auto <span className="whitespace-nowrap">non-stop</span> în <span className="text-beacon">Chiajna, Militari</span>, pe A1 și Centura
        </h1>
        <p className="mt-5 max-w-[46ch] text-[length:var(--step-1)] text-paint/85">
          Pe Autostrada București–Pitești, pe Centura București și în zonele din jur. Alegi vehiculul și traseul, vezi prețul în câteva secunde, apoi suni sau scrii pe WhatsApp cu totul deja calculat.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="#calculator" className="btn btn-beacon min-h-14 px-6 text-[length:var(--step-1)]">Calculează prețul</Link>
          <CallButtons size="lg" quiet />
        </div>
      </div>

      <div data-anim className="relative mt-10 h-[clamp(10rem,24vw,17rem)] overflow-hidden" aria-hidden="true">
        {/* distant city at night, drifting slowly (ambient) */}
        <div className="skyline-par absolute inset-0">
        <svg className="skyline absolute bottom-[38%] left-0 h-[45%] w-[200%] opacity-40" viewBox="0 0 1600 120" preserveAspectRatio="none">
          {Array.from({ length: 2 }).map((_, k) => (
            <g key={k} transform={`translate(${k * 800} 0)`} fill="#2f3a4b">
              {[[0,70,60],[60,40,40],[100,85,55],[155,55,30],[185,95,70],[255,30,45],[300,75,50],[350,50,35],[385,100,60],[445,65,40],[485,35,55],[540,80,45],[585,55,60],[645,90,40],[685,45,50],[735,70,65]].map(([x, h, w]) => (
                <rect key={x} x={x} y={120 - h} width={w} height={h} />
              ))}
              {[[120,50],[200,40],[395,30],[560,55],[660,35]].map(([x, y]) => <rect key={x} x={x} y={120 - y} width="3" height="3" fill="#f2b33d" opacity=".7" />)}
            </g>
          ))}
        </svg>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-asphalt-3" />
        <div className="absolute inset-x-0 bottom-[38%] h-[3px] bg-paint/25" />
        <div className="lane absolute inset-x-0 bottom-[18%] h-1.5 opacity-80" />
        {/* far-lane traffic: a car passes now and then */}
        <div className="traffic absolute bottom-[26%] left-0 w-[clamp(4.5rem,9vw,7rem)] opacity-60" style={{ transform: "translateX(-30vw)" }}>
          <div className="-scale-x-100"><VehicleArt id="sedan" paint="graphite" className="w-full" /></div>
        </div>
        <div className="truck-in absolute bottom-[4%] left-[max(1rem,calc(50%-38rem))] w-[min(84vw,36rem)]">
          {/* headlight beam */}
          <svg className="pointer-events-none opacity-50 absolute -right-[38%] bottom-[22%] w-[45%]" viewBox="0 0 200 60" aria-hidden="true">
            <defs><linearGradient id="beam-g" x1="0" x2="1"><stop offset="0" stopColor="#fff3c4" stopOpacity=".8" /><stop offset="1" stopColor="#fff3c4" stopOpacity="0" /></linearGradient></defs>
            <path d="M0 26 L200 0 L200 60 L0 34 Z" fill="url(#beam-g)" />
          </svg>
          <TowTruck className="relative w-full drop-shadow-[0_18px_20px_rgba(0,0,0,.35)]" />
          {/* beacons as HTML layers over the SVG: blinking them doesn't repaint the truck */}
          <span className="beacon-dot" style={{ left: "73.9%", top: "23.2%" }} />
          <span className="beacon-dot beacon-b" style={{ left: "79.6%", top: "23.2%" }} />
        </div>
      </div>
    </section>
  );
}

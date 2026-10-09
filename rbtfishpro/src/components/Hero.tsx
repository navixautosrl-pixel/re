import Link from "next/link";
import { Picture } from "@/components/Picture";

/**
 * PRIMARY moment #1. The client's night photo (17 kg carp, Balta Lazăr, Alexandria) is the LCP
 * element — eager + high priority, never hidden. Headline lines rise out of a mask (CSS only),
 * the photo settles from 107% → 100%. CTAs are visible and clickable from the first frame.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[max(40rem,100svh)] flex-col justify-end overflow-hidden pt-16">
      <div className="grain absolute inset-0 -z-10">
        <Picture
          base="/img/catch-night"
          widths={[480, 800, 1045]}
          width={1045}
          height={1040}
          eager
          sizes="(min-width: 1045px) 70vw, 100vw"
          alt="Pescar ținând un crap mare noaptea, pe malul bălții, sub sălcii"
          className="hero-photo absolute right-0 top-0 h-[68%] w-full object-cover object-[62%_center] md:h-full md:w-[72%] md:object-center"
        />
        {/* Scrims: text side (desktop: left; mobile: bottom) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--night)_34%,color-mix(in_oklch,var(--night)_40%,transparent)_50%,transparent_68%),linear-gradient(to_bottom,color-mix(in_oklch,var(--night)_70%,transparent),transparent_14%)] md:bg-[linear-gradient(to_right,var(--night)_28%,color-mix(in_oklch,var(--night)_70%,transparent)_45%,transparent_70%),linear-gradient(to_top,var(--night),transparent_30%)]" />
      </div>

      <div className="wrap pb-14 md:pb-20">
        <h1 id="hero-title" className="display text-[length:var(--step-5)]">
          <span className="hero-line"><span>Boilies</span></span>
          <span className="hero-line"><span>pentru <span className="text-cyan">crap</span></span></span>
        </h1>
        <p className="hero-fade measure mt-6 max-w-[34rem] text-[length:var(--step-1)] text-mist">
          Patru rețete RbtFishPro pe două baze, Fishmeal și Birdfood. Fiecare în 20 sau 24 mm.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/magazin" className="btn btn-primary">Descoperă boiliesurile</Link>
          <Link href="#gama" className="btn btn-ghost">Vezi gama</Link>
        </div>
        <p className="mt-10 flex items-center gap-3 text-[length:var(--step--1)] text-lamp md:absolute md:bottom-20 md:right-[var(--gutter)] md:mt-0">
          <span aria-hidden="true" className="h-px w-8 bg-lamp" />
          Crap de 17 kg, Balta Lazăr din Alexandria
        </p>
      </div>
    </section>
  );
}

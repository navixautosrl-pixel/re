import Link from "next/link";
import type { Product } from "@/data/products";
import { RANGES } from "@/data/products";
import { BagImage } from "@/components/Picture";
import { Price } from "@/components/Price";

/** The bag stands on a dark plinth over the water line; ripples spread on hover (ambient). */
export function ProductCard({ p, headingLevel = "h3", eager }: { p: Product; headingLevel?: "h2" | "h3"; eager?: boolean }) {
  const H = headingLevel;
  return (
    <article className="bag group relative flex h-full flex-col">
      <div className="relative isolate grid aspect-[4/5] place-items-end justify-center overflow-hidden rounded-[var(--radius-panel)] bg-[radial-gradient(120%_70%_at_50%_100%,var(--reed),var(--night-2)_65%)] px-3 pt-6 sm:px-6 sm:pt-8">
        <span aria-hidden="true" className="absolute inset-x-0 bottom-[11%] h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
        <span aria-hidden="true" className="ripples"><span /><span /><span /></span>
        <BagImage base={p.image.base} width={p.image.width} height={p.image.height} alt={p.image.alt} eager={eager} className="relative z-10 mb-[7%] h-auto max-h-full w-[min(70%,13rem)] drop-shadow-[0_18px_22px_rgba(0,0,0,0.55)]" />
        <span aria-hidden="true" className="absolute left-0 top-0 h-1 w-full" style={{ background: p.accent }} />
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[length:var(--step--1)] font-semibold text-mist-2">
          {RANGES[p.range].label} · {p.diameters.join(" sau ")} mm
        </p>
        <H className="display-2 mt-1 text-[clamp(1.25rem,1rem+1.2vw,2.1rem)]">
          <Link href={`/produse/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline">
            {p.name}
          </Link>
        </H>
        <p className="mt-1 text-mist-2">{p.flavour}</p>
        <Price lei={p.price} className="mt-auto pt-3" />
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[var(--radius-panel)] ring-cyan group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}

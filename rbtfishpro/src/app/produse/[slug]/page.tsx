import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { bySlug, products, RANGES } from "@/data/products";
import { AddToCart } from "@/components/AddToCart";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BagImage } from "@/components/Picture";
import { JsonLd } from "@/components/JsonLd";
import { Placeholder } from "@/components/Placeholder";
import { Price } from "@/components/Price";
import { ProductCard } from "@/components/ProductCard";
import { abs, pageMeta } from "@/lib/seo";
import { t } from "@/i18n/ro";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produse/[slug]">): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.seoTitle, description: p.seoDescription, path: `/produse/${p.slug}` });
}

const AVAILABILITY = { "in-stoc": "În stoc", "la-comanda": "La comandă", indisponibil: "Indisponibil momentan" } as const;
const SCHEMA_AVAILABILITY = { "in-stoc": "InStock", "la-comanda": "PreOrder", indisponibil: "OutOfStock" } as const;

/** Product structured data — only emitted once the price is real (never a placeholder in schema). */
function productLd(p: NonNullable<ReturnType<typeof bySlug>>) {
  if (!site.catalog.pricesConfirmed) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Boilies ${p.name}`,
    description: p.summary,
    image: abs(`${p.image.base}.webp`),
    brand: { "@type": "Brand", name: site.name },
    sku: p.slug,
    offers: {
      "@type": "Offer",
      url: abs(`/produse/${p.slug}`),
      priceCurrency: site.currency,
      price: p.price.toFixed(2),
      ...(p.availability ? { availability: `https://schema.org/${SCHEMA_AVAILABILITY[p.availability]}` } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/produse/[slug]">) {
  const p = bySlug((await params).slug);
  if (!p) notFound();
  const related = [...products.filter((o) => o.slug !== p.slug && o.range === p.range), ...products.filter((o) => o.range !== p.range)].slice(0, 3);
  const ld = productLd(p);

  return (
    <>
      <div className="wrap pt-24">
        <Breadcrumbs items={[{ name: "Magazin", path: "/magazin" }, { name: p.name, path: `/produse/${p.slug}` }]} />
      </div>

      <section className="wrap mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-14">
        <figure>
          <div className="relative grid aspect-[4/5] place-items-end justify-center overflow-hidden rounded-[var(--radius-panel)] bg-[radial-gradient(120%_70%_at_50%_100%,var(--reed),var(--night-2)_65%)] pt-10">
            <span aria-hidden="true" className="absolute inset-x-0 bottom-[10%] h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
            <span aria-hidden="true" className="absolute left-0 top-0 h-1 w-full" style={{ background: p.accent }} />
            <BagImage base={p.image.base} width={p.image.width} height={p.image.height} alt={p.image.alt} eager className="relative mb-[6%] h-auto w-[min(56%,245px)] drop-shadow-[0_22px_26px_rgba(0,0,0,0.6)]" />
          </div>
          <figcaption className="mt-3 text-[length:var(--step--1)] text-mist-2">
            Imagine din afișul gamei RBT Fish Pro. <Placeholder field={`photo.${p.slug}`}>fotografie reală a pungii, față și spate</Placeholder>
          </figcaption>
        </figure>

        <div>
          <p className="font-semibold text-mist-2">
            <Link href={`/magazin?baza=${p.range}`} className="link">{RANGES[p.range].label}</Link> · boilies pentru crap
          </p>
          <h1 className="display mt-2 text-[length:var(--step-4)]">{p.name}</h1>
          <p className="mt-2 text-[length:var(--step-1)] text-mist-2">{p.flavour}</p>
          <Price lei={p.price} className="mt-5 text-[length:var(--step-2)]" />
          <p className="mt-2 text-[length:var(--step--1)] text-mist-2">
            Gramaj: {p.packWeight ?? <Placeholder field={`packWeight.${p.slug}`}>gramajul pungii</Placeholder>} ·{" "}
            {p.availability ? AVAILABILITY[p.availability] : t.product.availabilityUnknown}
          </p>

          <p className="measure mt-6">{p.summary}</p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Ce scrie pe ambalaj">
            {p.verifiedFacts.map((f) => (
              <li key={f} className="rounded-[var(--radius-btn)] border border-moss/70 bg-reed/60 px-3 py-1 text-[length:var(--step--1)] font-semibold">{f}</li>
            ))}
          </ul>

          <div className="mt-8 border-t border-white/10 pt-8">
            <AddToCart product={{ slug: p.slug, name: p.name, diameters: p.diameters }} />
          </div>

          <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
            <details className="group py-1">
              <summary className="flex min-h-12 items-center justify-between font-semibold">Ingrediente și valori <span className="chev text-xl text-cyan" aria-hidden="true">+</span></summary>
              <p className="pb-4 text-mist-2">{p.ingredients ?? <Placeholder field={`ingredients.${p.slug}`}>lista de ingrediente de pe etichetă</Placeholder>}</p>
            </details>
            <details className="group py-1">
              <summary className="flex min-h-12 items-center justify-between font-semibold">Cum alegi diametrul <span className="chev text-xl text-cyan" aria-hidden="true">+</span></summary>
              <p className="pb-4 text-mist-2">
                Orientativ, din practica generală la crap: 20 mm e alegerea obișnuită; 24 mm e mai selectiv acolo unde peștele mărunt (caras, plătică) ajunge primul la nadă. Nu e o regulă fixă — apa și sezonul decid.{" "}
                <Link href="/#ghid" className="link">Ghid după temperatura apei</Link>
              </p>
            </details>
            <details className="group py-1">
              <summary className="flex min-h-12 items-center justify-between font-semibold">Păstrare <span className="chev text-xl text-cyan" aria-hidden="true">+</span></summary>
              <p className="pb-4 text-mist-2"><Placeholder field={`storage.${p.slug}`}>condiții de păstrare și termen de valabilitate</Placeholder></p>
            </details>
          </div>
          <p className="mt-4 text-[length:var(--step--1)] font-semibold">{t.product.inapt}.</p>
        </div>
      </section>

      <section className="wrap mt-24 mb-24" aria-labelledby="related">
        <h2 id="related" className="display text-[length:var(--step-3)]">Alte rețete</h2>
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}><ProductCard p={r} /></li>
          ))}
        </ul>
      </section>
      {ld && <JsonLd data={ld} />}
    </>
  );
}

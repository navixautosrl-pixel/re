import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/config/site";
import { LANDINGS, type Landing } from "@/data/landings";
import { Calculator, CalculatorFromUrl } from "@/components/Calculator";
import { CallButtons } from "@/components/CallButtons";
import { ExampleTable } from "@/components/ExampleTable";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { breadcrumbLd } from "@/lib/seo";
import { TowTruck } from "@/components/Vehicles";
import { LandingCards } from "@/components/LandingCards";

const pathOf = (slug: string) => `/${slug}/`;
const crumbsFor = (l: Landing) => [
  { name: "Acasă", path: "/" },
  ...(l.group === "serviciu" ? [{ name: "Servicii", path: "/servicii/" }] : l.group === "ghid" ? [] : [{ name: "Zone", path: "/zone-deservite/" }]),
  ...(l.group === "localitate" ? [{ name: "Ilfov", path: "/tractari-ilfov/" }] : l.group === "sector" ? [{ name: "Sectoare", path: "/tractari-sectoare-bucuresti/" }] : []),
  { name: l.nav, path: pathOf(l.slug) },
];

export function LandingPage({ l }: { l: Landing }) {
  const crumbs = crumbsFor(l);
  const related = l.related.map((s) => LANDINGS.find((x) => x.slug === s)).filter(Boolean) as Landing[];
  const serviceLd = l.serviceType && {
    "@context": "https://schema.org",
    "@type": "Service",
    name: l.h1,
    description: l.description,
    serviceType: l.serviceType,
    url: `${site.url}${pathOf(l.slug)}`,
    provider: { "@id": `${site.url}/#org` },
    ...(l.areaServed ? { areaServed: l.areaServed.map((name) => ({ "@type": "Place", name })) } : {}),
  };

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-asphalt pt-24 text-paint md:pt-28">
        <div className="wrap rise">
          <nav aria-label="Firimituri" className="text-[length:var(--step--1)] text-paint/75">
            <ol className="flex flex-wrap gap-x-2">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i === crumbs.length - 1 ? <span aria-current="page">{c.name}</span> : <Link className="link inline-block min-h-6" href={c.path}>{c.name}</Link>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-5 max-w-[20ch] text-[length:var(--step-4)]">{l.h1}</h1>
          <p className="mt-5 max-w-[52ch] text-[length:var(--step-1)] text-paint/85">{l.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#calculator" className="btn btn-beacon min-h-14 px-6 text-[length:var(--step-1)]">Calculează prețul</Link>
            <CallButtons size="lg" quiet />
          </div>
        </div>
        {/* road strip: the tow truck drives in and keeps rolling (same motion language as the home hero) */}
        <div data-anim className="relative mt-10 h-[clamp(6rem,13vw,9rem)] overflow-hidden" aria-hidden="true">
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-asphalt-3" />
          <div className="lane absolute inset-x-0 bottom-[18%] h-1 opacity-70" />
          <div className="truck-in absolute bottom-[2%] right-[max(1rem,calc(50%-38rem))] w-[min(56vw,21rem)]">
            <TowTruck className="w-full drop-shadow-[0_12px_14px_rgba(0,0,0,.35)]" />
            <span className="beacon-dot" style={{ left: "73.9%", top: "23.2%" }} />
            <span className="beacon-dot beacon-b" style={{ left: "79.6%", top: "23.2%" }} />
          </div>
        </div>
      </section>

      <div className="wrap grid gap-12 py-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <article className="space-y-12">
          {l.sections.map((s, i) => (
            <Reveal as="section" key={s.h2} delay={i ? 40 : 0}>
              <h2 className="sd-sharpen text-[length:var(--step-2)]">{s.h2}</h2>
              <div className="prose-road mt-4">{s.body}</div>
            </Reveal>
          ))}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {l.examples && l.examples.length > 0 && <ExampleTable vehicle={l.vehicle} kms={l.examples} />}
          <div className="rounded-[var(--radius-l)] bg-sign p-6 text-white on-dark">
            <p className="text-[length:var(--step-1)] font-[800]">Zonă acoperită</p>
            <p className="mt-1 text-white/85">{site.serviceArea}</p>
            <Link href="/tarife-tractari/" className="mt-4 inline-block font-[700] underline underline-offset-4">Toate tarifele</Link>
          </div>
        </aside>
      </div>

      {l.children && (
        <section aria-labelledby="children-l" className="wrap pb-16">
          <h2 id="children-l" className="text-[length:var(--step-3)]">{l.children === "localitate" ? "Pagini pe localități" : "Pagini pe sectoare"}</h2>
          <div className="mt-6"><LandingCards group={l.children} /></div>
        </section>
      )}

      <section id="calculator" aria-label="Calculator preț" className="scroll-mt-16 bg-concrete-2 py-16">
        <div className="wrap">
          <Suspense fallback={<Calculator initialVehicle={l.vehicle} />}>
            <CalculatorFromUrl defaultVehicle={l.vehicle} />
          </Suspense>
        </div>
      </section>

      {l.faq.length > 0 && (
        <section aria-labelledby="faq-l" className="wrap py-16">
          <h2 id="faq-l" className="text-[length:var(--step-3)]">Întrebări despre {l.nav.toLowerCase().startsWith("ghid") ? "acest ghid" : l.nav}</h2>
          <div className="mt-6 divide-y divide-rule rounded-[var(--radius-l)] bg-card ring-1 ring-rule">
            {l.faq.map((f) => (
              <details key={f.q} className="group px-5">
                <summary className="flex min-h-16 items-center justify-between gap-5 py-4">
                  <h3 className="text-[length:var(--step-1)] font-[750] leading-snug tracking-normal">{f.q}</h3>
                  <svg className="chev shrink-0 text-sign" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="max-w-[65ch] pb-5 text-ink-2">{f.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <nav aria-labelledby="rel-l" className="wrap pb-20">
          <h2 id="rel-l" className="text-[length:var(--step-2)]">Vezi și</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={pathOf(r.slug)} className="block h-full rounded-[var(--radius-m)] bg-card p-5 ring-1 ring-rule transition hover:-translate-y-0.5 hover:ring-sign">
                  <span className="font-[800]">{r.nav}</span>
                  <span className="mt-1 block text-[length:var(--step--1)] text-ink-2">{r.lead}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <JsonLd data={breadcrumbLd(crumbs)} />
      {serviceLd && <JsonLd data={serviceLd} />}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { ogImages, withBasePath } from "@/lib/basePath";
import { clientProjects, pricingPlans, siteConfig } from "@/lib/constants";
import { jsonLd } from "@/lib/jsonLd";
import { getNiche, niches } from "@/lib/niches";

/*
 * O pagină pe nișă. Structura e comună — problemele, ce trebuie să aibă
 * site-ul, întrebări frecvente — dar textul e scris separat pentru fiecare,
 * în `src/lib/niches.ts`. Asta e diferența dintre un set de pagini care
 * merită să existe și „doorway pages”: șablonul poate fi același, conținutul
 * nu are voie să fie.
 */

export function generateStaticParams() {
  return niches.map((niche) => ({ slug: niche.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const niche = getNiche(slug);
  if (!niche) return {};

  const url = `/creare-site/${niche.slug}`;
  return {
    title: { absolute: niche.title },
    description: niche.description,
    alternates: { canonical: url },
    openGraph: {
      title: niche.title,
      description: niche.description,
      url,
      images: ogImages,
    },
  };
}

export default async function NichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const niche = getNiche(slug);
  if (!niche) notFound();

  const origin = `https://${siteConfig.domain}`;
  const url = `${origin}/creare-site/${niche.slug}`;
  const plan = pricingPlans.find((p) => p.id === niche.recommended);
  const proof = (niche.proof ?? [])
    .map((id) => clientProjects.find((project) => project.id === id))
    .filter((project): project is NonNullable<typeof project> => !!project);
  const related = niche.related.map(getNiche).filter((n): n is NonNullable<typeof n> => !!n);

  // Firul Ana are rost dublu: îl vede omul, în capul paginii, și îl citește
  // Google, care îl afișează în rezultate în locul adresei brute.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Domenii", item: `${origin}/creare-site` },
      { "@type": "ListItem", position: 3, name: niche.label, item: url },
    ],
  };

  // Întrebările marcate sunt exact cele de pe pagină, cuvânt cu cuvânt —
  // altfel marcajul descrie conținut care nu există.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: "ro-RO",
    mainEntity: niche.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: niche.h1,
    description: niche.description,
    serviceType: "Creare website",
    url,
    inLanguage: "ro-RO",
    areaServed: { "@type": "Country", name: "România" },
    provider: { "@id": `${origin}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(serviceLd) }} />

      {/* ---- Antet ---- */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40">
        <div className="gradient-mesh" aria-hidden="true" />
        <div className="grid-field absolute inset-0 opacity-30" aria-hidden="true" />

        <div className="container-max relative z-10 px-5 sm:px-8 lg:px-10">
          <nav aria-label="Firul Ariadnei" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="py-1 transition-colors hover:text-foreground">
                  Acasă
                </Link>
              </li>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              <li>
                <Link href="/creare-site" className="py-1 transition-colors hover:text-foreground">
                  Domenii
                </Link>
              </li>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              <li aria-current="page" className="py-1 text-foreground">
                {niche.label}
              </li>
            </ol>
          </nav>

          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">{niche.category}</p>
            <h1
              className="font-display mt-4 max-w-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-foreground"
              style={{ fontSize: "clamp(2.1rem, 5.4vw, 4.2rem)" }}
            >
              {niche.h1}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{niche.lead}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button href="/#contact" variant="primary" size="lg">
                Cere o ofertă
              </Button>
              <Button href="/#pachete" variant="outline" size="lg" icon={false} className="rounded-full">
                Vezi pachetele
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Dovada ----
           Sus, înaintea oricărui argument: proprietarul de baltă care ajunge
           aici vrea să vadă o baltă, nu o listă de calități. */}
      {proof.length ? (
        <section className="border-t border-border bg-surface section-y">
          <div className="container-max px-5 sm:px-8 lg:px-10">
            <Reveal>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">
                Am construit deja pentru {niche.label.toLowerCase()}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Sunt online acum, pe domeniile lor. Intră și uită-te — e cel mai cinstit mod de a-ți da seama dacă
                ne merită banii.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:gap-6 lg:grid-cols-2">
              {proof.map((project, i) => (
                <Reveal key={project.id} delay={i * 0.07}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener"
                    className="group flex h-full gap-5 rounded-lg border border-border bg-background p-5 transition-colors hover:border-accent-2 sm:gap-7 sm:p-7"
                  >
                    {/* Capturile sunt făcute pe telefon, deci se arată ca
                        atare: ramă de telefon, decupată de sus, cu marginile
                        rotunjite. Un ecran de telefon întins pe lățimea unui
                        card ar minți despre ce ai văzut. */}
                    {project.preview ? (
                      <div className="shrink-0 overflow-hidden rounded-[1.1rem] border border-border-strong bg-black shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={withBasePath(project.preview)}
                          alt={`Site-ul ${project.title}, văzut pe telefon`}
                          width={640}
                          height={1263}
                          loading="lazy"
                          decoding="async"
                          className="h-[15rem] w-[7.4rem] object-cover object-top transition-transform duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.04] sm:h-[19rem] sm:w-[9.4rem]"
                        />
                      </div>
                    ) : null}

                    <div className="flex min-w-0 flex-col">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-2">
                        {project.category}
                      </p>
                      <h3 className="font-display mt-2 text-xl font-semibold text-foreground sm:text-2xl">
                        {project.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                      {/* „baltalazaralexandria.ro” e un singur cuvânt de 23
                          de caractere: fără break-all împingea cardul în
                          lateral la 320px, lângă previzualizarea telefonului. */}
                      <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-medium text-foreground">
                        <span className="break-all">{project.href.replace("https://", "")}</span>
                        <ArrowUpRight
                          className="size-4 shrink-0 transition-transform group-hover:rotate-45"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Problemele ---- */}
      <section className="section-y border-t border-border">
        <div className="container-max px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ce te costă acum, fără un site ca lumea
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {niche.problems.map((problem, i) => (
              <Reveal key={problem.title} delay={i * 0.08} className="bg-surface p-7 sm:p-8">
                <p className="font-display text-sm font-semibold text-accent-2">0{i + 1}</p>
                <h3 className="font-display mt-4 text-lg font-semibold text-foreground">{problem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{problem.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Ce trebuie să aibă ---- */}
      <section className="section-y border-t border-border bg-surface">
        <div className="container-max px-5 sm:px-8 lg:px-10">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:col-span-7">
              Ce trebuie să aibă un site pentru {niche.name}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
              Lista nu e generică. Sunt secțiunile fără de care site-ul arată bine și nu produce nimic.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {niche.mustHave.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 0.06}>
                <div className="flex gap-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-blue-purple)]">
                    <Check className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="mt-14 border-t border-border pt-9">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Se poate adăuga oricând
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {niche.extras.map((extra) => (
                <li
                  key={extra}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
                >
                  {extra}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---- Pachetul potrivit ---- */}
      {plan ? (
        <section className="section-y border-t border-border">
          <div className="container-max px-5 sm:px-8 lg:px-10">
            <Reveal className="mx-auto max-w-2xl rounded-lg border border-border bg-surface p-8 text-center sm:p-11">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-2">
                Pachetul care acoperă de obicei
              </p>
              <p className="font-display mt-4 text-4xl font-semibold text-foreground sm:text-5xl">{plan.name}</p>
              <p className="font-display mt-2 text-2xl font-semibold text-accent-2">{plan.price}</p>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">{plan.audience}</p>
              <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
                Prețul e orientativ. Oferta finală se face după ce discutăm ce anume ai nevoie — uneori iese mai
                puțin decât pachetul, alteori mai mult.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/#contact" variant="primary">
                  Cere o ofertă
                </Button>
                <Button href="/#pachete" variant="outline" icon={false} className="rounded-full">
                  Compară pachetele
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---- Întrebări ---- */}
      <section className="section-y border-t border-border bg-surface">
        <div className="container-max px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Întrebări frecvente
            </h2>
          </Reveal>

          {/* <details> nativ: se deschide fără JavaScript, e accesibil din
              start, iar Google citește răspunsul chiar dacă e închis. */}
          <div className="mt-11 divide-y divide-border border-y border-border">
            {niche.faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left">
                  <h3 className="font-display text-base font-medium text-foreground sm:text-lg">{item.q}</h3>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border transition-transform duration-300 group-open:rotate-45">
                    <span className="relative block size-3.5">
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-foreground" />
                      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-foreground" />
                    </span>
                  </span>
                </summary>
                <p className="max-w-3xl pb-7 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Nișe înrudite ---- */}
      {related.length ? (
        <section className="section-y border-t border-border">
          <div className="container-max px-5 sm:px-8 lg:px-10">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Construim și pentru
              </h2>
            </Reveal>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.slug} delay={i * 0.06}>
                  <Link
                    href={`/creare-site/${item.slug}`}
                    className="group flex h-full flex-col justify-between rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent-2"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-2">
                        {item.category}
                      </p>
                      <h3 className="font-display mt-3 text-lg font-semibold text-foreground">{item.label}</h3>
                    </div>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      Vezi detalii
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.12} className="mt-9">
              <Link
                href="/creare-site"
                className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-accent-2 transition-colors hover:text-foreground"
              >
                Toate domeniile
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  );
}

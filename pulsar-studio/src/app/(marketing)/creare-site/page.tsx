import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/Button";
import { ogImages } from "@/lib/basePath";
import { siteConfig } from "@/lib/constants";
import { jsonLd } from "@/lib/jsonLd";
import { nicheCategories, niches } from "@/lib/niches";

const TITLE = "Creare site pe domenii de activitate";
const DESCRIPTION =
  "Site-uri construite pe specificul domeniului: bălți de pescuit, detailing și tractări auto, padel, tenis, bazine, shaormerii, magazine online și altele.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/creare-site" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/creare-site", images: ogImages },
};

export default function NicheHubPage() {
  const origin = `https://${siteConfig.domain}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Domenii", item: `${origin}/creare-site` },
    ],
  };

  // Lista paginilor copil, declarată explicit: ajută Google să înțeleagă că
  // e un index, nu o pagină de conținut care se repetă.
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: TITLE,
    itemListElement: niches.map((niche, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: niche.h1,
      url: `${origin}/creare-site/${niche.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(listLd) }} />

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
              <li aria-current="page" className="py-1 text-foreground">
                Domenii
              </li>
            </ol>
          </nav>

          <Reveal>
            <h1
              className="font-display max-w-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-foreground"
              style={{ fontSize: "clamp(2.1rem, 5.4vw, 4.2rem)" }}
            >
              Creare site pe domenii de activitate
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Un site de baltă de pescuit și unul de cabinet stomatologic nu au aproape nimic în comun, în afară de
              faptul că ambele se deschid într-un browser. Mai jos scrie, pentru fiecare domeniu, ce probleme are
              online și ce trebuie să aibă site-ul ca să le rezolve.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Nu găsești domeniul tău?{" "}
              <Link href="/#contact" className="text-accent-2 underline underline-offset-4">
                Scrie-ne
              </Link>{" "}
              — lucrăm și în afara listei, iar lista se lungește pe măsură ce livrăm.
            </p>

            <div className="mt-9">
              <Button href="/#contact" variant="primary" size="lg">
                Cere o ofertă
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {nicheCategories.map((category, catIndex) => {
        const items = niches.filter((n) => n.category === category);
        if (!items.length) return null;

        return (
          <section
            key={category}
            className={`section-y border-t border-border ${catIndex % 2 === 1 ? "bg-surface" : ""}`}
          >
            <div className="container-max px-5 sm:px-8 lg:px-10">
              <Reveal>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {category}
                </h2>
              </Reveal>

              <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((niche, i) => (
                  <Reveal key={niche.slug} delay={(i % 3) * 0.06}>
                    <Link
                      href={`/creare-site/${niche.slug}`}
                      className="group flex h-full flex-col justify-between rounded-lg border border-border bg-background p-7 transition-colors hover:border-accent-2"
                    >
                      <div>
                        <h3 className="font-display text-xl font-semibold text-foreground">{niche.label}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{niche.description}</p>
                      </div>
                      <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent-2">
                        Vezi ce include
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

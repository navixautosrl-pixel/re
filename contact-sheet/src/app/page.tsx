import { Hero } from "@/components/Hero";
import { Sheet } from "@/components/Sheet";
import { FilmStrip } from "@/components/FilmStrip";
import { Method } from "@/components/Method";
import { JsonLd } from "@/components/JsonLd";
import { projects, shortName } from "@/lib/projects";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Sheet />
      <FilmStrip />
      <Method />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", "@id": `${site.url}/#website`, url: `${site.url}/`, name: site.name, inLanguage: "en" },
            {
              "@type": "CollectionPage", "@id": `${site.url}/#page`, url: `${site.url}/`, name: `${site.name}: websites built in this repo`,
              description: site.description, isPartOf: { "@id": `${site.url}/#website` },
              mainEntity: {
                "@type": "ItemList", numberOfItems: projects.length,
                itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: shortName(p), url: `${site.url}/work/${p.slug}/` })),
              },
            },
          ],
        }}
      />
    </main>
  );
}

import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { ToolWall } from "@/components/ToolWall";
import { Pipeline } from "@/components/Pipeline";
import { Gaps } from "@/components/Gaps";
import { Usage } from "@/components/Usage";
import { site } from "@/lib/site";
import { skills } from "@/lib/skills";

// JSON-LD describes only what the page itself shows. There's no Organization,
// because there's no real business behind this demo.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: `${site.url}/`, name: site.name, inLanguage: "en" },
    {
      "@type": "WebPage",
      "@id": `${site.url}/#webpage`,
      url: `${site.url}/`,
      name: `${site.name}: a shadow board of website-building skills`,
      description: site.description,
      isPartOf: { "@id": `${site.url}/#website` },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${site.url}/#skills`,
      name: "Claude Code skills for building websites",
      numberOfItems: skills.length,
      itemListElement: skills.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ToolWall />
        <Pipeline />
        <Gaps />
        <Usage />
      </main>
      <footer className="mx-auto flex w-[min(100%-2rem,76rem)] flex-wrap justify-between gap-4 py-10 text-sm text-ink-2">
        <p>Skill Atelier is an internal demo page built from <code>.claude/skills/</code> in this repository.</p>
        <p>
          Third-party skills: see <code>.claude/THIRD_PARTY_SKILLS.md</code>
        </p>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

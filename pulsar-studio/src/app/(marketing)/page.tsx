import { siteConfig, faqItems } from "@/lib/constants";
import { Hero } from "@/components/sections/Hero";
import { Trust } from "@/components/sections/Trust";
import { Services } from "@/components/sections/Services";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Portfolio } from "@/components/sections/Portfolio";
import { WhyUs } from "@/components/sections/WhyUs";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contact } from "@/components/sections/Contact";

// Only describes what this page actually renders: the FAQ entries below are
// the same ones visible in the FAQ section, which is what FAQPage requires.
//
// `@id` and `publisher` point at the organisation node declared in the root
// layout, so Google reads one business with a site and an FAQ, instead of
// three unconnected things that happen to share a domain.
const origin = `https://${siteConfig.domain}`;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: siteConfig.name,
    url: origin,
    description: siteConfig.seoDescription,
    inLanguage: "ro-RO",
    publisher: { "@id": `${origin}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${origin}/#faq`,
    inLanguage: "ro-RO",
    isPartOf: { "@id": `${origin}/#website` },
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Trust />
      <Services />
      <Pricing />
      <Process />
      <Portfolio />
      <WhyUs />
      <FAQ />
      <FinalCTA />
      <Contact />
    </>
  );
}

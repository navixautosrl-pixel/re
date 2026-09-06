import { Hero } from "@/components/sections/Hero";
import { MarqueeStrip } from "@/components/shared/MarqueeStrip";
import { Services } from "@/components/sections/Services";
import { Showcase } from "@/components/sections/Showcase";
import { Process } from "@/components/sections/Process";
import { Gallery } from "@/components/sections/Gallery";
import { Reviews } from "@/components/sections/Reviews";
import { Contact } from "@/components/sections/Contact";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

const tickerItems = [
  "SPĂLARE EXTERIOARĂ",
  "DETAILING INTERIOR",
  "PROTECȚIE CERAMICĂ",
  "POLISH FARURI",
  "TAPIȚERIE CA NOUĂ",
  "CHIAJNA · ILFOV",
];

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip items={tickerItems} />
      <Services />
      <Showcase />
      <Process />
      <Gallery />
      <Reviews />
      <Contact />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

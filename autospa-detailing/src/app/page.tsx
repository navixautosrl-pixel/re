import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Reviews } from "@/components/sections/Reviews";
import { FAQSection } from "@/components/sections/FAQSection";
import { Contact } from "@/components/sections/Contact";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Reviews />
      <Contact />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

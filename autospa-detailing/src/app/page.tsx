import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Reviews } from "@/components/sections/Reviews";
import { FAQSection } from "@/components/sections/FAQSection";
import { Contact } from "@/components/sections/Contact";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <Reviews />
      <Contact />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

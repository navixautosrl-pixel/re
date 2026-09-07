import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { WebsiteDevelopment } from "@/components/sections/WebsiteDevelopment";
import { Performance } from "@/components/sections/Performance";
import { SEO } from "@/components/sections/SEO";
import { MarketingDigital } from "@/components/sections/MarketingDigital";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import { WhyUs } from "@/components/sections/WhyUs";
import { RobixHostPartnership } from "@/components/sections/RobixHostPartnership";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WebsiteDevelopment />
      <Performance />
      <SEO />
      <MarketingDigital />
      <Portfolio />
      <Process />
      <WhyUs />
      <RobixHostPartnership />
      <FAQSection />
      <FinalCTA />
      <Contact />
    </>
  );
}

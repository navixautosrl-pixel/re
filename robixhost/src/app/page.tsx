import { CinematicIntro } from "@/components/intro/CinematicIntro";
import { Hero } from "@/components/sections/Hero";
import { LiveInfrastructure } from "@/components/sections/LiveInfrastructure";
import { HostingProducts } from "@/components/sections/HostingProducts";
import { HostingPlans } from "@/components/sections/HostingPlans";
import { WhyRobixHost } from "@/components/sections/WhyRobixHost";
import { DDoSProtection } from "@/components/sections/DDoSProtection";
import { ServerInfrastructure } from "@/components/sections/ServerInfrastructure";
import { Speed } from "@/components/sections/Speed";
import { GameServers } from "@/components/sections/GameServers";
import { DomainSearch } from "@/components/sections/DomainSearch";
import { Reviews } from "@/components/sections/Reviews";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <CinematicIntro />
      <Hero />
      <LiveInfrastructure />
      <HostingProducts />
      <HostingPlans />
      <WhyRobixHost />
      <DDoSProtection />
      <ServerInfrastructure />
      <Speed />
      <GameServers />
      <DomainSearch />
      <Reviews />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

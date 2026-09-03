import { CinematicIntro } from "@/components/intro/CinematicIntro";
import { Hero } from "@/components/sections/Hero";
import { Performance } from "@/components/sections/Performance";
import { LiveInfrastructure } from "@/components/sections/LiveInfrastructure";
import { DDoSProtection } from "@/components/sections/DDoSProtection";
import { HostingProducts } from "@/components/sections/HostingProducts";
import { ServerInfrastructure } from "@/components/sections/ServerInfrastructure";
import { GameServers } from "@/components/sections/GameServers";
import { HostingPlans } from "@/components/sections/HostingPlans";
import { Trust } from "@/components/sections/Trust";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <CinematicIntro />
      <Hero />
      <Performance />
      <LiveInfrastructure />
      <DDoSProtection />
      <HostingProducts />
      <ServerInfrastructure />
      <GameServers />
      <HostingPlans />
      <Trust />
      <FAQSection index="09" />
      <FinalCTA index="10" />
    </>
  );
}

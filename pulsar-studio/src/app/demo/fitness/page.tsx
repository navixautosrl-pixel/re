import type { Metadata } from "next";
import { ogImages } from "@/lib/basePath";
import "@fontsource/anton/latin.css";
import "@fontsource/anton/latin-ext.css";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { FitnessNavbar } from "./_sections/Navbar";
import { FitnessHero } from "./_sections/Hero";
import { FitnessClasses } from "./_sections/Classes";
import { FitnessPricing } from "./_sections/Pricing";
import { FitnessTrainers } from "./_sections/Trainers";
import { FitnessSchedule } from "./_sections/Schedule";
import { FitnessContactFooter } from "./_sections/ContactFooter";

export const metadata: Metadata = {
  title: { absolute: "FORGE — Demo sală de fitness · Pulsar Studio" },
  description: "Demo concept: website de sală de fitness, construit de Pulsar Studio. Nu este o afacere reală.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demo/fitness" },
  openGraph: { title: "FORGE — Demo sală de fitness · Pulsar Studio", description: "Demo concept: website de sală de fitness, construit de Pulsar Studio. Nu este o afacere reală.", url: "/demo/fitness" , images: ogImages },
};

export default function FitnessDemoPage() {
  return (
    <div id="demo-scope" className="demo-fitness font-sans" style={{ background: "var(--f-bg)", color: "var(--f-fg)" }}>
      <FitnessNavbar />
      <main id="main">
        <FitnessHero />
        <FitnessClasses />
        <FitnessPricing />
        <FitnessTrainers />
        <FitnessSchedule />
        <FitnessContactFooter />
      </main>
      <DemoBadge dark topClassName="top-28" />
    </div>
  );
}

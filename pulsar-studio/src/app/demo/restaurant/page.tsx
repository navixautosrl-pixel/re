import type { Metadata } from "next";
import { ogImages } from "@/lib/basePath";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-ext-500.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-ext-600.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-ext-700.css";
import "@fontsource/playfair-display/latin-500-italic.css";
import "@fontsource/playfair-display/latin-ext-500-italic.css";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { RestaurantNavbar } from "./_sections/Navbar";
import { RestaurantHero } from "./_sections/Hero";
import { RestaurantMenu } from "./_sections/Menu";
import { RestaurantGallery } from "./_sections/Gallery";
import { RestaurantAbout } from "./_sections/About";
import { RestaurantReservation } from "./_sections/Reservation";
import { RestaurantContactFooter } from "./_sections/ContactFooter";

export const metadata: Metadata = {
  title: { absolute: "Ember — Demo restaurant · Pulsar Studio" },
  description: "Demo concept: website de restaurant premium, construit de Pulsar Studio. Nu este o afacere reală.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demo/restaurant" },
  openGraph: { title: "Ember — Demo restaurant · Pulsar Studio", description: "Demo concept: website de restaurant premium, construit de Pulsar Studio. Nu este o afacere reală.", url: "/demo/restaurant" , images: ogImages },
};

export default function RestaurantDemoPage() {
  return (
    <div id="demo-scope" className="demo-restaurant font-sans" style={{ background: "var(--r-bg)", color: "var(--r-fg)" }}>
      <RestaurantNavbar />
      <main id="main">
        <RestaurantHero />
        <RestaurantMenu />
        <RestaurantGallery />
        <RestaurantAbout />
        <RestaurantReservation />
        <RestaurantContactFooter />
      </main>
      <DemoBadge dark />
    </div>
  );
}

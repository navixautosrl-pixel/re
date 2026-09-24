import type { Metadata } from "next";
import { ogImages } from "@/lib/basePath";
import "@fontsource/unbounded/latin-600.css";
import "@fontsource/unbounded/latin-ext-600.css";
import "@fontsource/unbounded/latin-700.css";
import "@fontsource/unbounded/latin-ext-700.css";
import "@fontsource/unbounded/latin-800.css";
import "@fontsource/unbounded/latin-ext-800.css";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { AgencyNavbar } from "./_sections/Navbar";
import { AgencyHero } from "./_sections/Hero";
import { AgencyPortfolio } from "./_sections/Portfolio";
import { AgencyServices } from "./_sections/Services";
import { AgencyAbout } from "./_sections/About";
import { AgencyContactFooter } from "./_sections/ContactFooter";

export const metadata: Metadata = {
  title: { absolute: "FIELD — Demo agenție creativă · CreareWebsitePro" },
  description: "FIELD — demo de site pentru agenție creativă: portofoliu, servicii și contact. Exemplu construit de CreareWebsitePro. Nu este o afacere reală.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demo/agency" },
  openGraph: { title: "FIELD — Demo agenție creativă · CreareWebsitePro", description: "FIELD — demo de site pentru agenție creativă: portofoliu, servicii și contact. Exemplu construit de CreareWebsitePro. Nu este o afacere reală.", url: "/demo/agency" , images: ogImages },
};

export default function AgencyDemoPage() {
  return (
    <div id="demo-scope" className="demo-agency font-sans" style={{ background: "var(--a-bg)", color: "var(--a-fg)" }}>
      <AgencyNavbar />
      <main id="main">
        <AgencyHero />
        <AgencyPortfolio />
        <AgencyServices />
        <AgencyAbout />
        <AgencyContactFooter />
      </main>
      <DemoBadge dark={false} />
    </div>
  );
}

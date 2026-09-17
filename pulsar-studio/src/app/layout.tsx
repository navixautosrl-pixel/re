import type { Metadata } from "next";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { siteConfig } from "@/lib/constants";
import { withBasePath } from "@/lib/basePath";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "creare website",
    "website-uri la cheie",
    "magazin online",
    "SEO",
    "marketing digital",
    "mentenanță website",
    "agenție digitală",
    "partener RobixHost",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description: siteConfig.description,
    email: siteConfig.email,
    areaServed: "RO",
    sameAs: [siteConfig.robixHostUrl],
  };

  return (
    <html lang="ro">
      <head>
        <link rel="icon" href={withBasePath("/favicon.png")} type="image/png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a
          href="#main"
          className="glass fixed left-4 top-4 z-[100] -translate-y-20 rounded-md px-4 py-2 text-sm font-medium text-foreground transition-transform focus-visible:translate-y-0"
        >
          Sari la conținut
        </a>
        <SmoothScroll />
        <CursorGlow />
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

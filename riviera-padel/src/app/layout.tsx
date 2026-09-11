import type { Metadata } from "next";
import "@fontsource/saira-extra-condensed/700.css";
import "@fontsource/saira-extra-condensed/800.css";
import "@fontsource/saira-extra-condensed/900.css";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/shared/StickyMobileCTA";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: `${siteConfig.fullName} — Padel, Ping-Pong și Biliard în București`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "padel București",
    "teren padel București",
    "padel Bucuresti",
    "club padel București",
    "padel Mehadia",
    "ping pong București",
    "biliard București",
    "Riviera Padel",
    "Riviera Padel Lounge",
    "terenuri de padel București",
    "rezervare padel București",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: siteConfig.fullName,
    title: `${siteConfig.fullName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: siteConfig.fullName,
    telephone: siteConfig.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.addressLine1,
      addressLocality: siteConfig.city,
      postalCode: siteConfig.postalCode,
      addressCountry: "RO",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.rating,
      reviewCount: siteConfig.reviewCount,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Padel", value: true },
      { "@type": "LocationFeatureSpecification", name: "Ping-Pong", value: true },
      { "@type": "LocationFeatureSpecification", name: "Biliard", value: true },
    ],
  };

  return (
    <html lang="ro">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyMobileCTA />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "@fontsource/bebas-neue/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL("https://autospadetailing.ro"),
  title: {
    default: `${siteConfig.name} — Spălătorie Auto & Detailing în Chiajna, Ilfov`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "spalatorie auto Chiajna",
    "detailing auto Ilfov",
    "curatare tapiterie auto",
    "spalatorie auto Dudu",
    "detailing auto Bucuresti",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Mașina ta, ca nouă.`,
    description: siteConfig.description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: siteConfig.name,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Strada Ion Luca Caragiale",
      addressLocality: "Dudu, Chiajna",
      addressRegion: "Ilfov",
      postalCode: "077041",
      addressCountry: "RO",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.rating,
      reviewCount: siteConfig.reviewCount,
    },
  };

  return (
    <html lang="ro">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}

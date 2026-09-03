import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Web Hosting, VPS și Game Servers în România`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "web hosting Romania",
    "hosting Romania",
    "VPS Romania",
    "servere VPS",
    "game server hosting",
    "domain hosting",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Hosting built for what's next.`,
    description: siteConfig.description,
    images: [{ url: "/brand/logo.webp", width: 700, height: 700, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — Hosting built for what's next.`,
    description: siteConfig.description,
    images: ["/brand/logo.webp"],
  },
  icons: {
    icon: "/brand/logo.webp",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}

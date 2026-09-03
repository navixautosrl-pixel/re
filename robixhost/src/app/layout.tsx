import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Web Hosting, VPS și Servere Dedicate în România`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "web hosting Romania",
    "hosting Romania",
    "VPS Romania",
    "servere VPS",
    "servere dedicate",
    "game server hosting",
    "domenii Romania",
    "creare website",
    "digital marketing",
    "optimizare SEO",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Infrastructure built for performance.`,
    description: siteConfig.description,
    images: [{ url: "/brand/logo.webp", width: 700, height: 700, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — Infrastructure built for performance.`,
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
    <html
      lang="ro"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}

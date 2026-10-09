import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/config/site";
import { t } from "@/i18n/ro";
import "./globals.css";

// Self-hosted, subset to Latin + Romanian (ă â î ș ț) — no third-party font request.
// The display cut is large and heavy: "optional" keeps it from reflowing on slow first visits (CLS).
const display = localFont({
  src: [
    { path: "../fonts/barlow-condensed-800-italic.woff2", weight: "800", style: "italic" },
    { path: "../fonts/barlow-condensed-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--ff-display",
  display: "optional",
  preload: true,
});
const body = localFont({
  src: [
    { path: "../fonts/barlow-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/barlow-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--ff-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "RbtFishPro — boilies pentru crap: Fishmeal și Birdfood, 20 și 24 mm", template: "%s | RbtFishPro" },
  description:
    "Boilies RbtFishPro pentru pescuitul la crap: Fishmeal fără aromă, Fishmeal cu squid și prună, Birdfood Scopex și Birdfood Căpșună, în 20 sau 24 mm.",
  applicationName: site.name,
  // Until the business details are confirmed the whole site stays out of search results.
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0f140e", colorScheme: "dark" };

const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: `${site.url}/img/label-fishmeal-480.webp` },
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url, inLanguage: "ro-RO", publisher: { "@id": `${site.url}/#org` } },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={site.lang} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so reveal styles never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <div id="top-sentinel" aria-hidden="true" className="absolute top-0 h-px w-px" />
        <a href="#main" className="btn btn-primary fixed left-4 top-3 z-50 -translate-y-24 focus:translate-y-0">
          {t.nav.skip}
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <JsonLd data={orgLd} />
      </body>
    </html>
  );
}

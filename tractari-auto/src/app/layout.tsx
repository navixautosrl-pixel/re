import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCallBar } from "@/components/MobileCallBar";
import { site } from "@/config/site";
import "./globals.css";

// Overpass (OFL), subset: Latin + a 3 KB file with ă ș ț Ă Ș Ț. "optional" = no reflow on slow
// first visits. The Latin face has no metric fallback so the Romanian file is reached for ș/ț.
const latin = localFont({ src: "../fonts/overpass-latin.woff2", weight: "100 900", variable: "--ff-latin", display: "optional", adjustFontFallback: false });
const ro = localFont({ src: "../fonts/overpass-ro.woff2", weight: "100 900", variable: "--ff-ro", display: "optional" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `Tractări auto cu preț calculat online | ${site.name}`, template: `%s | ${site.name}` },
  description: "Tractări și transport auto pe platformă. Calculează prețul online: alegi vehiculul, de unde și până unde, și vezi totalul înainte să suni.",
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#232a35" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className={`${latin.variable} ${ro.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <div id="top-sentinel" aria-hidden="true" className="absolute top-0 h-px w-px" />
        <a href="#main" className="btn btn-beacon fixed left-4 top-3 z-50 -translate-y-24 focus:translate-y-0">Sari la conținut</a>
        <Header />
        <ViewTransition name="page">
          <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        </ViewTransition>
        <Footer />
        <MobileCallBar />
      </body>
    </html>
  );
}

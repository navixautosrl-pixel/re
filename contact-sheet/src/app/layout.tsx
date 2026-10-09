import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { withBasePath } from "@/lib/base-path";
import { SiteHeader } from "@/components/SiteHeader";

// Bricolage Grotesque (opsz + wght axes), subset to the glyphs this site uses (47 KB).
// Romanian ă ș ț live in a 3.5 KB second subset that the font stack falls back to per glyph.
const bricolage = localFont({
  src: "../fonts/bricolage-opsz-wght-latin.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  // "optional", not "swap": measured with real (devtools) throttling, the swap reflowed the
  // weight-760/opsz-96 headline and caused CLS 0.236 — no metric fallback matches that cut.
  // Preloaded, so it's normally ready for first paint; on a slow first visit the fallback
  // stays for that view instead of jumping, and the cached font is used next time.
  display: "optional",
});
const bricolageRo = localFont({
  src: "../fonts/bricolage-opsz-wght-ro.woff2",
  variable: "--font-bricolage-ro",
  weight: "200 800",
  display: "swap",
  preload: false,
});
const plexMono = localFont({
  src: "../fonts/plex-mono-500-edge.woff2",
  variable: "--font-plex-mono",
  weight: "500",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: websites built in this repo, proofed`, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  icons: { icon: withBasePath("/icon.svg") },
  openGraph: { type: "website", siteName: site.name, images: [{ url: withBasePath("/og.png"), width: 1200, height: 630, alt: "A contact sheet of website screenshots on a light table" }] },
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f6f7f9", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${bricolageRo.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-film focus:px-4 focus:py-2 focus:text-table">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <footer className="mx-auto mt-[var(--section)] flex w-[min(100%-2rem,78rem)] flex-wrap justify-between gap-4 border-t border-rule py-10 text-sm text-ink-2">
          <p>Contact Sheet is an internal demo built from this repository. Screenshots are of each site&rsquo;s own build.</p>
          <p>Made with the repo&rsquo;s <code>site-builder</code> skill pipeline.</p>
        </footer>
      </body>
    </html>
  );
}

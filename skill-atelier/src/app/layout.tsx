import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { withBasePath } from "@/lib/base-path";
import { MotionProvider } from "@/components/MotionProvider";

// next/font preloads the file and generates a metric-matched fallback, which
// removes the font-swap layout shift Lighthouse measured with the plain @fontsource CSS.
const archivo = localFont({
  // Subset of @fontsource-variable/archivo (latin, wght+wdth axes kept) to the glyphs this
  // page uses: 90KB → 43KB. Regenerate with the pyftsubset command in README.md.
  src: "../fonts/archivo-wdth-wght-basic.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const title = `${site.name}: website-building skills for Claude Code`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  icons: { icon: withBasePath("/icon.svg") },
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description: site.description,
    url: "/",
    images: [{ url: withBasePath("/og.png"), width: 1200, height: 630, alt: "Skill Atelier: tool outlines on a pegboard" }],
  },
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#eef1f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-ground"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

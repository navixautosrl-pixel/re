import type { Metadata } from "next";
// Romanian needs latin + latin-ext (ă â î ș ț); the bare weight imports
// also ship vietnamese/cyrillic faces this site will never render.
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-ext-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-ext-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/space-grotesk/latin-ext-700.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-ext-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-ext-500.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/dm-sans/latin-ext-700.css";
import "./globals.css";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
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
    url: "/",
    images: [
      {
        url: withBasePath("/og.png"),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [withBasePath("/og.png")],
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
        {children}
      </body>
    </html>
  );
}

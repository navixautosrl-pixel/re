import type { Metadata, Viewport } from "next";
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
import { siteConfig, seoKeywords, services, pricingPlans } from "@/lib/constants";
import { withBasePath } from "@/lib/basePath";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: siteConfig.seoTitle,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.seoDescription,
  keywords: seoKeywords,
  authors: [{ name: siteConfig.name, url: `https://${siteConfig.domain}` }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "Web design",
  // Let Google show full snippets and large image previews rather than the
  // conservative defaults.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: siteConfig.name,
    title: siteConfig.seoTitle,
    description: siteConfig.seoDescription,
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
    title: siteConfig.seoTitle,
    description: siteConfig.seoDescription,
    images: [withBasePath("/og.png")],
  },
  alternates: {
    canonical: "/",
    languages: { "ro-RO": "/" },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

// "1.490 lei" -> 1490. The thousands separator is a dot in Romanian, so a
// plain parseFloat would read it as 1.49.
function toAmount(price: string) {
  return Number(price.replace(/[^0-9]/g, ""));
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const origin = `https://${siteConfig.domain}`;

  // Everything below is stated on the page itself — services offered, the
  // published package prices, the contact address, the hosting partner.
  // Nothing about staff, ratings, reviews, addresses or founding dates is
  // asserted, because none of it is established.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${origin}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: origin,
    description: siteConfig.seoDescription,
    email: siteConfig.email,
    image: `${origin}/og.png`,
    logo: `${origin}/og.png`,
    inLanguage: "ro-RO",
    areaServed: { "@type": "Country", name: "România" },
    knowsAbout: seoKeywords,
    sameAs: [siteConfig.robixHostUrl],
    priceRange: `${toAmount(pricingPlans[0].price)}-${toAmount(
      pricingPlans[pricingPlans.length - 1].price
    )} RON`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Pachete website",
      itemListElement: pricingPlans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.audience,
        url: `${origin}/#pachete`,
        // "de la" plans are a starting price, so they're declared as a
        // minimum rather than a flat one.
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "RON",
          ...(plan.priceNote
            ? { minPrice: toAmount(plan.price) }
            : { price: toAmount(plan.price) }),
        },
      })),
    },
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.summary,
        serviceType: service.name,
        provider: { "@id": `${origin}/#organization` },
        areaServed: { "@type": "Country", name: "România" },
      },
    })),
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

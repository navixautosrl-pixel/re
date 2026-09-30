import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { niches } from "@/lib/niches";

export const dynamic = "force-static";

/*
 * Aici intră numai paginile care se pot indexa.
 *
 * Lipsesc intenționat:
 *  - paginile legale, marcate `noindex`;
 *  - cele patru demo-uri, marcate `noindex, nofollow` — sunt afaceri
 *    fictive, iar un restaurant care nu există n-are ce căuta în
 *    rezultatele Google ca și cum ar fi real.
 *
 * O pagină trimisă în sitemap și refuzată în meta este exact contradicția
 * pe care Search Console o raportează ca eroare („Submitted URL marked
 * noindex”), așa că lista de mai jos trebuie să rămână în acord cu
 * `robots` din metadata fiecărei pagini.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${siteConfig.domain}`;
  const now = new Date();

  const nichePages = niches.map((niche) => ({
    url: `${base}/creare-site/${niche.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/creare-site`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...nichePages,
  ];
}

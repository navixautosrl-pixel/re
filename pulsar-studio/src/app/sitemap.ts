import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { niches } from "@/lib/niches";

export const dynamic = "force-static";

/*
 * Paginile legale lipsesc intenționat: sunt marcate `noindex`, iar o pagină
 * dată în sitemap și refuzată în meta este exact contradicția pe care
 * Search Console o raportează ca eroare.
 *
 * Paginile de domeniu sunt cele pe care vrem să le găsească Google, deci au
 * prioritate mare — mai mare decât demo-urile, care doar arată ce livrăm.
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

  const demos = ["restaurant", "fitness", "shop", "agency"].map((slug) => ({
    url: `${base}/demo/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/creare-site`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...nichePages,
    ...demos,
  ];
}

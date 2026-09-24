import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export const dynamic = "force-static";

/*
 * Paginile legale lipsesc intenționat: sunt marcate `noindex`, iar o pagină
 * dată în sitemap și refuzată în meta este exact contradicția pe care
 * Search Console o raportează ca eroare.
 *
 * Demo-urile intră, cu prioritate mică: sunt conținut public real, care
 * arată ce livrăm, dar nu sunt pagina pe care vrem să se claseze site-ul.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${siteConfig.domain}`;
  const now = new Date();

  const demos = ["restaurant", "fitness", "shop", "agency"].map((slug) => ({
    url: `${base}/demo/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...demos,
  ];
}

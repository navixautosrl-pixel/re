import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { products } from "@/data/products";

// Public, indexable pages only (legal drafts join once reviewed — remove their noindex too).
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/magazin", "/despre-noi", "/intrebari-frecvente", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p === "/" ? "" : p}`, changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${site.url}/produse/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}

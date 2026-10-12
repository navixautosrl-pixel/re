import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { LANDINGS } from "@/data/landings";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const core = ["/", "/calculator/", "/tarife-tractari/", "/servicii/", "/zone-deservite/", "/contact/"];
  return [
    ...core.map((p) => ({ url: `${site.url}${p}`, priority: p === "/" ? 1 : 0.8 })),
    ...LANDINGS.map((l) => ({ url: `${site.url}/${l.slug}/`, priority: l.group === "ghid" ? 0.5 : 0.9 })),
  ];
}

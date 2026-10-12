import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/calculator/", "/servicii/", "/contact/"].map((p) => ({ url: `${site.url}${p}`, priority: p === "/" ? 1 : 0.8 }));
}

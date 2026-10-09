import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Staging / before launch: keep everything out of search engines.
  if (!site.indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cos", "/finalizare-comanda", "/comanda-trimisa"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

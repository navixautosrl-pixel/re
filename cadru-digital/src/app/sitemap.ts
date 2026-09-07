import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export const dynamic = "force-static";

const routes = ["", "/confidentialitate", "/termeni"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `https://${siteConfig.domain}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "yearly",
    priority: route === "" ? 1 : 0.3,
  }));
}

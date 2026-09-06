import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const routes = ["", "/privacy", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `https://autospadetailing.ro${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "yearly",
    priority: route === "" ? 1 : 0.3,
  }));
}

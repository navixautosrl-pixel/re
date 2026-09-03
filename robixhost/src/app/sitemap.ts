import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export const dynamic = "force-static";

const routes = [
  "",
  "/hosting",
  "/vps",
  "/game-servers",
  "/dedicated-servers",
  "/domains",
  "/pricing",
  "/web-design",
  "/digital-marketing",
  "/seo",
  "/about",
  "/contact",
  "/support",
  "/status",
  "/faq",
  "/terms",
  "/privacy",
  "/cookies",
  "/gdpr",
  "/refund-policy",
  "/acceptable-use",
  "/sla",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/pricing" || route === "/hosting" ? 0.8 : 0.5,
  }));
}

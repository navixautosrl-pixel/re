import type { Metadata } from "next";
import { site } from "@/config/site";

export function pageMeta({ title, description, path, absolute }: { title: string; description: string; path: string; absolute?: boolean }): Metadata {
  return {
    // Brand suffix only when the whole title still fits in Google's ~65 characters.
    title: { absolute: absolute || `${title} | ${site.name}`.length > 65 ? title : `${title} | ${site.name}` },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", locale: "ro_RO", siteName: site.name, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Platformă de tractări cu o mașină încărcată, pe o șosea noaptea" }] },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

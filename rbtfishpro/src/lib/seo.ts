import type { Metadata } from "next";
import { site } from "@/config/site";

export const abs = (path: string) => `${site.url}${path}`;

/** Per-page metadata with canonical + OG; `private` pages (cart, checkout, legal drafts) are never indexed. */
export function pageMeta({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", locale: "ro_RO", siteName: site.name, images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Crap prins la răsărit, cu sigla RBT Fish Pro" }] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

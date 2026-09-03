---
name: seo
description: SEO for the Next.js app-builder stack — metadata, sitemap, robots, structured data, per public route. Use for the SEO stage of an app-builder pipeline, applied per route as it's built and again as a full pass before deployment.
---

# SEO

Owns the SEO stage of the `app-builder` pipeline. Applies to every **public** route (marketing pages, pricing, blog if any) — authenticated app screens (dashboard, settings) don't need SEO treatment beyond not accidentally being indexed.

## Per public route

- `generateMetadata` (dynamic routes) or a static `metadata` export: real `title`, `description` — specific to that page's actual content, not the site name repeated.
- Canonical URL set.
- Open Graph + Twitter card metadata (title, description, image) — reuse a real image or a generated `opengraph-image.tsx`, never a broken/placeholder image path.
- Semantic heading order (`h1` once per page, `h2`/`h3` nested correctly) — this is also an accessibility requirement, not just SEO.
- Descriptive `alt` text on real content images (empty `alt=""` only for genuinely decorative images).
- Clean URLs (`/pricing`, not `/page?id=3`).

## Site-wide, once

- `app/sitemap.ts` — every public route, updated as routes are added (generate it, don't hand-maintain a list that drifts).
- `app/robots.ts` — allow public routes, disallow authenticated app routes (`/dashboard`, `/settings`, `/api/*` etc.) so they're never indexed even if reachable.
- Structured data (JSON-LD) only where it's genuinely applicable (e.g. `Organization`, `Product`/`Offer` for pricing, `FAQPage` for a real FAQ) and only with real, verifiable values — never invent a rating, a price, or an address to fill out a schema. Per CLAUDE.md: mark unavailable facts as placeholders instead of fabricating them.

## Internal linking

Every public page should be reachable from at least one other public page (nav, footer, or in-content link) — an orphaned page with no internal links is effectively invisible to both users and crawlers.

## Verify, don't assume

After building metadata, actually render the page (Playwright or a browser) and check the `<head>` output, not just the source code — a metadata bug (wrong export shape, missing `await` on a dynamic value) can silently produce an empty `<title>` even though the code "looks right".

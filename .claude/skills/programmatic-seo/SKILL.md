---
name: programmatic-seo
description: Programmatic SEO done safely — deciding if a page template deserves to scale, dataset requirements, unique-value-per-page rules, templates with real data, generateStaticParams/static generation, internal linking hubs, indexation controls, quality gates against thin/doorway pages, and staged rollout measured in Search Console. Use before generating many similar pages (cities, niches, integrations, comparisons).
---

# Programmatic SEO

## Purpose

Generate many pages only when each one answers a distinct search need with distinct,
true information. Otherwise: don't.

## When to activate

Requests like "one page per city/niche/service/integration", "comparison pages", "glossary at scale". (This repo already did a 16-niche-page build — the same gates apply to extending it.)

## Go / no-go test (write answers down)

1. Is there real search demand per variant (GSC queries, autocomplete, client data)? Unknown → start with 3–5 variants, measure.
2. Does each page have **unique, verifiable data** (prices, specs, local projects, inventory, availability, examples)? If the only variable is the city/niche name → **no-go** (doorway pages, Google spam policy "scaled content abuse").
3. Would a user who lands on variant A be worse served by a single general page? If not → one strong page instead.

## Procedure

1. **Dataset first**: a typed source (`data/*.json` validated with zod, or CMS) with required fields per page; minimum content threshold (e.g. ≥ 3 unique facts + 1 unique example/image).
2. **Template**: unique `<title>`/H1/meta built from data; sections that render only when data exists (no empty headings); one block of genuinely variant-specific copy written or reviewed by a human/AI with the data, not spun synonyms.
3. **Generation (Next.js static)**:
   ```ts
   export function generateStaticParams() { return niches.filter(isPublishable).map((n) => ({ slug: n.slug })); }
   export const dynamicParams = false; // unknown slugs → 404
   export async function generateMetadata({ params }) { const n = bySlug((await params).slug); return { title: n.title, description: n.description, alternates: { canonical: `/nise/${n.slug}/` } }; }
   ```
4. **Quality gate script** before publishing: for every pair of pages compute text similarity of main content (e.g. shingled Jaccard); flag pairs > ~0.6; flag pages under the word/fact threshold; publish only passing pages (`isPublishable`), keep others `noindex` or unbuilt.
5. **Internal linking**: hub page listing all variants with descriptive anchors; related-variant links; breadcrumb (BreadcrumbList JSON-LD).
6. **Indexation**: sitemap includes only publishable pages; `noindex` for thin/experimental variants; canonical to self.
7. **Rollout**: publish a batch (5–20), wait 3–6 weeks, check GSC Page indexing ("Crawled – currently not indexed" = quality signal) and Performance; expand only what works; prune/merge what doesn't.

## Failure prevention

- Same paragraph with the city swapped; invented local stats/testimonials per page.
- Thousands of URLs from filter combinations (crawl traps).
- Orphan pages not linked from anywhere.
- Pages generated from empty data rendering "undefined" or blank sections.

## Verification checklist

- [ ] Similarity report: no publishable pair above threshold (attach the numbers).
- [ ] `site_qa.mjs --pages` over a sample of 5 variants → 0 critical; titles/H1s unique.
- [ ] Sitemap count = publishable count; all pages reachable within 3 clicks.
- [ ] GSC review scheduled at +4 weeks with criteria for expand/prune.

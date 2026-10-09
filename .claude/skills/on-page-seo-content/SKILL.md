---
name: on-page-seo-content
description: On-page SEO and content architecture — search-intent analysis, keyword discovery without paid tools, keyword clustering and one-keyword-cluster-per-URL mapping, sitemap/URL design, title/meta/H1 writing, internal-linking plan, content briefs, cannibalization and content-gap checks, local (Romanian) and multilingual SEO with hreflang. Use during discovery/strategy for a new site, when writing or reviewing page copy for search, or when planning location/service pages. Technical crawl/index issues belong to technical-seo; JSON-LD to structured-data.
---

# On-page SEO & content architecture

## Purpose

Each URL answers one search intent better than the alternatives, and the site
structure makes that obvious to users and crawlers.

## When to activate

Strategy stage (sitemap + keyword map), copywriting stage (titles/headings/briefs), audits of existing content.

## Workflow

1. **Seed list** from the business: services × modifiers (location, price, "near me", problem phrasing, brand), in the site's language(s). Romanian: include diacritic and non-diacritic forms users actually type ("detailing auto Brasov" vs "Brașov") — target the natural form in copy, expect both in queries.
2. **Expand without fabricating volumes**: Google autocomplete / "People also ask" / related searches (if web access), competitors' page titles and H2s, the business's own FAQ/emails. If a keyword tool or Search Console data isn't available, label priorities as *qualitative* — never write "1,200 searches/month" from memory.
3. **Classify intent** per query: informational / commercial investigation / transactional / navigational / local. SERP shape (if observable) is the truth: if the top results are listicles, a service page won't rank for it.
4. **Cluster** queries that share intent and would be satisfied by the same page. One cluster → one URL. Two URLs targeting the same cluster = cannibalization.
5. **Keyword map** (deliverable):
   ```
   | URL | Primary query | Secondary queries | Intent | Page type | Primary CTA |
   | / | detailing auto brașov | ceramic coating brașov, … | local/transactional | home | Programează |
   | /servicii/protectie-ceramica/ | protecție ceramică auto | … | commercial | service | Cere ofertă |
   ```
6. **URL design**: short, lowercase, hyphenated, language-consistent, no dates/IDs for evergreen pages, trailing-slash policy consistent with the host (static export: `trailingSlash: true`).
7. **Per page**:
   - `<title>` ≤ ~60 chars: primary query + differentiator + brand. Unique per page.
   - Meta description 140–160 chars: the promise + proof + CTA. Not a keyword list.
   - One `<h1>` matching intent (can differ from title). H2s answer the sub-questions from step 2.
   - First 100 words state what/where/for whom.
   - Descriptive image `alt` (what's in the image, not keyword stuffing).
8. **Internal linking**: every page reachable in ≤3 clicks; service pages link to related services and to the contact/booking page with descriptive anchors ("protecție ceramică pentru mașini noi", not "click aici"); home links to every money page.
9. **Content brief** per important page: intent, audience question list, required facts (from client), proof assets available, competitor gaps, CTA, internal links in/out.
10. **Local SEO**: NAP (name, address, phone) identical everywhere (site footer, schema, Google Business Profile); one location page per *real* location — never city-swapped clones for places with no presence. GBP optimization is a recommendation to the client (we can't edit it without access).
11. **Multilingual**: separate URLs per language (`/en/…`), `<html lang>`, `hreflang` alternates including `x-default`, each page canonical to itself, translated (not just machine-swapped) titles/metas. Next.js: `alternates: { languages: { "ro-RO": "/", "en": "/en/" } }`.

## Content gap & cannibalization check (existing sites)

- List all indexable URLs + their title/H1 → group by primary query → >1 URL per group = cannibalization (merge, differentiate, or canonicalize).
- Questions from step 2 with no page answering them = gaps → add sections or pages only if they deserve a page.
- With Search Console access: queries with impressions but position > 10 on a page that should own them → improve that page.

## Never

- Promise rankings or traffic.
- Thin programmatic/location pages; doorway pages.
- Invented statistics, reviews, or "#1 in Romania" claims.

## Verification

- Every URL in the sitemap appears once in the keyword map and vice-versa.
- `site_qa.mjs` SEO section: unique title/description, 1 h1, canonical present, no broken internal links.
- Titles/descriptions reviewed in the built HTML (not only in source).

## Completion criteria

Keyword map + sitemap delivered, every page's title/meta/H1/intro/internal links written to it, no two pages competing for the same cluster, and all data sources (or their absence) stated.

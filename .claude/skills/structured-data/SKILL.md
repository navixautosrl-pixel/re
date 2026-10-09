---
name: structured-data
description: Schema.org JSON-LD for websites — choosing eligible types (Organization, WebSite, WebPage, BreadcrumbList, LocalBusiness subtypes, Service, Product/Offer, Article, Event, FAQPage), building one connected @graph with @id references, rendering safely in Next.js or HTML, and validating with the bundled offline validator plus Google's Rich Results Test. Use whenever a page gets structured data or structured data is audited. Never invents ratings, reviews, or business facts.
---

# Structured data (JSON-LD)

## Purpose

Describe real, visible page facts to search engines in a way that is valid, eligible
for rich results where applicable, and never misleading.

## When to activate

SEO stage of every public site; when adding products/prices/events/articles; when an
audit reports structured-data errors.

## Workflow

1. **Inventory facts** from `lib/site.ts` (or the user). Only facts that are true *and visible on the page* go in markup. Missing a fact → omit the property, don't fill it.
2. **Choose types per page**:
   - Every site: `Organization` (or the most specific `LocalBusiness` subtype, e.g. `AutoWash`, `SportsActivityLocation`, `ProfessionalService`) + `WebSite`.
   - Each page: `WebPage` (or `AboutPage`, `ContactPage`) + `BreadcrumbList` below the home page.
   - Services: `Service` with `provider` → the organization `@id`.
   - Prices: `Offer` (`price` as a plain number string, `priceCurrency` ISO 4217 e.g. `RON`, `EUR`).
   - Products (real shop): `Product` + `offers`; `aggregateRating`/`review` **only** with real, on-page reviews.
   - Blog: `Article`/`BlogPosting` with `datePublished`, `author`.
   - `FAQPage`: allowed only if the Q&A is visible; since Aug 2023 Google shows FAQ rich results only for well-known government/health sites, so expect no visual change.
3. **One graph, linked by `@id`**:
   ```json
   {
     "@context": "https://schema.org",
     "@graph": [
       { "@type": "AutoWash", "@id": "https://ex.ro/#business", "name": "…", "url": "https://ex.ro/",
         "telephone": "+40…", "address": { "@type": "PostalAddress", "streetAddress": "…", "addressLocality": "…", "postalCode": "…", "addressCountry": "RO" },
         "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday"], "opens": "09:00", "closes": "18:00" }] },
       { "@type": "WebSite", "@id": "https://ex.ro/#website", "url": "https://ex.ro/", "name": "…", "publisher": { "@id": "https://ex.ro/#business" }, "inLanguage": "ro-RO" },
       { "@type": "WebPage", "@id": "https://ex.ro/#webpage", "url": "https://ex.ro/", "name": "…", "isPartOf": { "@id": "https://ex.ro/#website" }, "about": { "@id": "https://ex.ro/#business" } }
     ]
   }
   ```
4. **Render safely**
   - Next.js: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />` in the Server Component for that route.
   - HTML: same JSON in a `<script type="application/ld+json">` in `<head>` or end of `<body>`.
   - Type-check with `schema-dts` (`import type { WithContext, Organization } from "schema-dts"`) when the project is TypeScript.
5. **Validate offline** on the built output:
   ```bash
   node .claude/skills/structured-data/scripts/validate_jsonld.mjs out/          # or a single .html
   ```
   It checks JSON syntax, `@context`, required properties for the types above, numeric `price`, placeholder-looking values, and flags every Review/AggregateRating for human confirmation and self-serving review markup.
6. **Validate online after deploy** (needs a public URL): Google Rich Results Test and validator.schema.org. Record results; if you couldn't run them, say so.

## Hard rules

- Never invent `aggregateRating`, `review`, `award`, `foundingDate`, `numberOfEmployees`, coordinates, opening hours, or prices.
- Markup must match visible content (Google spam policy) — no hidden FAQ, no prices that differ from the page.
- `sameAs` only for profiles that exist and belong to the business.
- Self-serving reviews (business reviewing itself, or ratings on Organization/LocalBusiness from the site's own widget) don't produce stars; don't add them for that purpose.

## Common failure modes

- Separate disconnected blocks repeating the business with different names/URLs.
- `price: "49 lei"` (must be `"49"` + `priceCurrency: "RON"`).
- Relative URLs in `url`/`@id` — always absolute, using the canonical origin.
- Markup copied from another project with its old business facts.

## Completion criteria

Validator exits 0 on every built page, every property traces to a visible fact, online validation done or explicitly listed as pending in the delivery report.

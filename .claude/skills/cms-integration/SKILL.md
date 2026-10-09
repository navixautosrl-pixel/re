---
name: cms-integration
description: Choosing and wiring a CMS for a website — when to add one, Sanity vs headless WordPress vs Git-based content, content models from page needs, fetching at build time for static export, rebuild-on-publish webhooks, drafts/preview, images, and editor handover. Use when a client needs to edit content without code. Sanity specifics → sanity-best-practices; modeling → content-modeling-best-practices.
---

# CMS integration

## Purpose

Let non-developers update content safely, without making the site slower, less secure,
or harder to deploy.

## When to activate

The client will edit pages, posts, services, prices, team, or products themselves; or an existing CMS must feed a new frontend.

## Decide (record the reason)

| Situation | Choose |
|---|---|
| Few updates a year, developer edits | No CMS — content in `lib/site.ts` / MDX in git |
| Marketing team edits often, custom design, static hosting | **Sanity** (hosted Studio, GROQ, image CDN) + Next static export rebuilt on publish |
| Client already lives in WordPress / needs plugins (forms, SEO plugins, WooCommerce) | **WordPress** (classic/block theme) or headless via REST/WPGraphQL — see `wordpress-router` |
| Shop | Shopify / WooCommerce (`ecommerce-development`) |
| Budget hosting only (cPanel, PHP) and editors | WordPress |

Confirm with the user before adding a paid/hosted service.

## Procedure (headless + static export)

1. **Model from content, not pages** (`content-modeling-best-practices`): `service`, `price`, `faq`, `testimonial` (with source + permission fields), `siteSettings` (NAP, socials) as singletons; reusable references over page-shaped blobs.
2. **Validation in the schema**: required fields, max lengths for titles/meta descriptions (≤ 60/160), alt text required on images, slug uniqueness.
3. **Fetch at build time** in Server Components; with `output: "export"` every route needs data at build (`generateStaticParams` for dynamic routes).
   ```ts
   // Sanity example (next-sanity)
   const services = await client.fetch(defineQuery(`*[_type=="service"]|order(order asc){title,"slug":slug.current,summary,price}`));
   ```
4. **Rebuild on publish**: CMS webhook → CI (`ci-cd-automation`) workflow_dispatch / Vercel deploy hook → build → deploy. Verify the webhook signature/secret.
5. **Preview/drafts**: needs a server (Next draft mode) — not available with static export; offer a staging deploy instead and say so.
6. **Images**: use the CMS image CDN with explicit `w`, `fm=webp/avif`, `fit` params and `width/height` in markup; hotspot/crop support for art direction.
7. **SEO fields**: per-document `seoTitle`, `seoDescription`, `ogImage`, `noindex`; sitemap generated from CMS slugs.
8. **Access**: least-privilege tokens (read-only token for build, never shipped to the client bundle); editor roles in the CMS.
9. **Handover**: short editor guide (`technical-documentation`) with screenshots: how to add a service, change a price, replace an image with alt text.

## Failure prevention

- CMS token in client code / `NEXT_PUBLIC_*`.
- Editors can publish without alt text or meta description → enforce in schema.
- Build breaks when an editor deletes a referenced document → handle null references in queries/components.
- Content changes never appear because nothing triggers a rebuild.

## Verification checklist

- [ ] Build from CMS data in CI succeeds; changing a field and triggering the webhook updates the live page (record timestamps).
- [ ] `grep -r "SANITY_API_TOKEN\|WP_APP_PASSWORD" out/` → nothing.
- [ ] Sitemap includes every published slug, excludes drafts/noindex.
- [ ] Editor guide tested by following it once.

## External dependencies

CMS account/project and API tokens from the client; api.sanity.io is **blocked** by this sandbox's network policy (checked 2026-10-09) — schemas/code can be written, live fetching cannot be tested here.

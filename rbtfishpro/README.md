# RbtFishPro — www.rbtfishpro.ro

Romanian-first online shop for RbtFishPro carp-fishing boilies. Next.js 16 (App Router) +
React 19 + TypeScript + Tailwind CSS 4, zod for validation, GSAP (lazy, desktop only) for one
scroll set piece. No database, no third-party scripts, no cookies.

> **Not published.** Nothing here has been deployed. Search engines are blocked
> (`noindex` + `Disallow: /`) until `SITE_INDEXABLE=true`, and orders are refused until prices are
> confirmed. See "Before launch".

## Run locally

```bash
npm ci
cp .env.example .env.local      # optional; everything is off by default
npm run dev                     # http://localhost:3000
# production check
npm run build && npm start
```

To try the full order flow locally with the example prices:

```bash
ORDER_SINK=file CONTACT_SINK=file ALLOW_PLACEHOLDER_ORDERS=true npm start
# orders → .data/orders.jsonl, messages → .data/contact.jsonl
```

## Checks

| Command | What it does |
|---|---|
| `npm run lint` | ESLint (Next config) |
| `npm run typecheck` | route types + `tsc --noEmit` |
| `npm run build` | production build |
| `npm test` | Playwright: cart maths/variants/persistence, shop search/filter/sort, checkout validation + a real order through the file sink, orders API (cross-site 403, qty cap 422, server-side pricing), contact form, mobile menu, reduced motion, no-JS, axe (WCAG 2.2 AA) on 9 pages, a visual baseline. Builds must exist first (`npm run build`). |
| `node scripts/shots.mjs <dir> /,/magazin` | full-page screenshots at 1440 and 390 px + console errors + horizontal-overflow check, against a running server on :3100 |

Repo-level tools used on this project (run from the repo root):
`.claude/skills/site-qa-playwright/scripts/site_qa.mjs --url …`,
`.claude/skills/structured-data/scripts/validate_jsonld.mjs <html dir>`,
`.claude/skills/gdpr-privacy/scripts/privacy_audit.mjs <url>`,
`.claude/skills/lighthouse-auditing/scripts/lh_runs.mjs <url> [--devtools]`.

## How it works

- **Catalogue**: `src/data/products.ts` — the four recipes on the client's range poster.
  Every business fact (contact, company, VAT, shipping, payment) lives in `src/config/site.ts`;
  `null` renders a visible dashed **placeholder** (`data-placeholder="…"`) instead of an invented
  value. `grep -r data-placeholder` in the built HTML lists what is still missing.
- **Cart**: `src/lib/cart.ts` — localStorage (`rbtfishpro.cart.v1`), validated on every read,
  synced across tabs. Prices are never stored; `src/lib/pricing.ts` computes everything in bani.
- **Orders**: `POST /api/orders` checks same-origin, rate limit (per IP + global), validates with
  the same zod schema the form uses, **re-prices on the server**, then delivers to the configured
  sink. Refuses with 503 while `catalog.pricesConfirmed` is false (unless
  `ALLOW_PLACEHOLDER_ORDERS=true`) or while no sink is configured. No card payments — the site
  never pretends to take payment.
- **Contact**: `POST /api/contact`, same protections, same sinks.
- **SEO**: per-page titles/descriptions/canonicals/OG (`src/lib/seo.ts`), `sitemap.xml`,
  `robots.txt`, Organization + WebSite + BreadcrumbList JSON-LD. **Product JSON-LD is emitted
  only when `pricesConfirmed` is true** — a placeholder price never reaches structured data.
  Cart/checkout/legal drafts are `noindex`.
- **Motion**: storyboard at the top of `src/app/page.tsx`. Hero entrance is CSS-only; one GSAP
  ScrollTrigger pin (`RangeStory`) loads only at ≥900 px with motion allowed; reveals are hidden
  only under `html.js` + no reduced motion, so content is always visible without JS.
- **English later**: shared UI strings are in `src/i18n/ro.ts` with a `Dict` type; add `en.ts` with
  the same keys and an `/en` route segment, plus `alternates.languages` (hreflang) in `pageMeta`.

## Deploy (only after authorisation)

**Vercel**: import the repo with root directory `rbtfishpro`, set env vars from `.env.example`
(`ORDER_SINK=resend` + `RESEND_API_KEY`/`MAIL_TO`/`MAIL_FROM` — the `file` sink does not work on
serverless), `SITE_URL`, and `SITE_INDEXABLE=true` only at launch. Point `www.rbtfishpro.ro` at it.

**Node host / VPS**: `npm ci && npm run build && npm start` behind nginx/Caddy (set
`x-real-ip`; `TRUSTED_PROXY_HOPS` if you rely on X-Forwarded-For). `ORDER_SINK=file` with a
persistent `DATA_DIR` works here; back the directory up.

Static cPanel hosting is **not** enough: the order and contact APIs need a Node runtime.

## Before launch — what RbtFishPro must supply

| Needed | Where it goes |
|---|---|
| Real price list per recipe/diameter, VAT status | `products.ts` `price`, `site.catalog` → set `pricesConfirmed: true` |
| Pack weight, ingredients, storage/shelf life, availability per product | `products.ts` |
| Real photographs of each bag (front/back); the current ones are crops of the range poster (low resolution, rendered artwork) | `public/img`, via `optimize_images.mjs` |
| Vector logo (SVG) | header/footer, favicon |
| Company: legal name, CUI, Reg. Com., registered office | `site.legalName`, `site.company` |
| Contact e-mail, phone, hours, address | `site.contact` |
| Shipping: courier, fee, free-shipping threshold, lead time | `site.shipping` |
| Payment methods actually offered (ramburs / transfer) → `confirmed: true` | `site.payment` |
| Return-cost policy and any exceptions | `/livrare-si-retur` |
| Brand story, production details, real usage/catch facts | `/despre-noi` |
| Hosting provider, e-mail provider, retention periods | privacy policy |
| Resend account + verified sender domain (or another provider) | env vars |
| Social profiles (only real ones) | `site.social` → also add `sameAs` |
| **Legal review** of Terms, Privacy, Cookies, Delivery & returns (drafts, `noindex`) | then remove `noindex`, add to sitemap |
| Substantiation for poster claims not used on the site ("atrage și păstrează peștii mai mult timp", "maximum results", "high attractant level") | only if evidence exists |

Not built (not requested or not possible without accounts): card payments (needs Stripe or
similar), newsletter (`site.newsletter.enabled` — needs a provider + double opt-in), analytics
(would need a consent banner first), stock management, an admin panel.

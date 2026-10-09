---
name: ecommerce-development
description: E-commerce architecture and product-page optimization — choosing a platform (Shopify/headless Shopify, WooCommerce, Stripe Checkout on Next.js), catalog and variant modeling, filtering/search with faceted-navigation SEO, cart and hosted checkout, tax/shipping configuration, transactional emails, order/refund flows, Product/Offer structured data and merchant feeds, and sandbox payment testing. Use when a site sells products or paid bookings online. Payment work also follows the security skill and the stripe plugin when authorized.
---

# E-commerce development

## Purpose

A shop that is fast, findable, trustworthy and legally sound — with payments that are
provably working in sandbox before anyone calls them live.

## When to activate

Any brief with a cart, checkout, product catalog, or paid booking.

## Platform decision (record it)

| Situation | Choose |
|---|---|
| Merchant manages products/orders themselves, < few thousand SKUs, wants apps | Shopify (theme or headless via Storefront API) |
| Already on WordPress, budget hosting | WooCommerce |
| Few products/services, custom design, developer-maintained | Next.js + Stripe Checkout (hosted) + Supabase for orders (via `app-builder`) |
| Complex B2B, ERP integration | Discuss with user — don't guess |

Hosted checkout (Shopify Checkout, Stripe Checkout/Payment Element) is the default: card data never touches our servers (PCI scope SAQ A). **Never store card numbers.**

## Workflow

1. **Catalog model**: product → variants (size/color) → SKU, price, compare-at price (only if a real previous price existed — EU Omnibus rule: show the lowest price of the last 30 days when announcing a discount), stock, weight, images (≥ 1200px, consistent crop, alt text describing the product).
2. **Category & filters**: categories = indexable landing pages with unique intro copy; filter combinations = `noindex` or canonical to the category, or blocked parameters — avoid crawl traps. Pagination with real `<a href>` links.
3. **Product page**: H1 product name, price with currency and VAT info, availability, variant selector that updates URL (`?variant=`), add-to-cart with feedback, shipping/returns summary near the button, real reviews only, related products.
4. **Cart & checkout**: persistent cart, editable quantities, clear totals (subtotal, shipping, tax), guest checkout, hosted payment, order confirmation page + email.
5. **Server-side truth**: prices/stock recalculated on the server (never trust client totals); webhooks (`checkout.session.completed`, `payment_intent.succeeded`) **signature-verified** and idempotent; order created from the webhook, not from the redirect page.
6. **Romania/EU legal (flag for the client, not legal advice)**: ANPC links + SOL/SAL (ODR) badges in footer, 14-day withdrawal info, Terms + Privacy + Cookies pages, company data (CUI, Reg. Com.), e-Factura obligations for invoicing.
7. **Structured data**: `Product` + `Offer` (`price`, `priceCurrency`, `availability`, `url`), `shippingDetails`/`hasMerchantReturnPolicy` when known → validate with `structured-data`.
8. **Merchant feed** (Google Merchant Center): generated from the same catalog source; prices/availability must match the page.
9. **Analytics**: GA4 e-commerce events `view_item`, `add_to_cart`, `begin_checkout`, `purchase` (with `transaction_id`, `value`, `currency`, `items`) — see `analytics-tracking`.
10. **Emails**: order confirmation, shipping, refund — plain-language, from a verified domain (SPF/DKIM/DMARC).

## Testing (required before "works")

- Stripe test mode: card `4242 4242 4242 4242` (success), `4000 0025 0000 3155` (3DS), `4000 0000 0000 9995` (declined); `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to test webhooks locally.
- Shopify: development store / Bogus Gateway.
- Verify: order record created once per payment (replay webhook → no duplicate), stock decremented, confirmation email sent, refund updates the order.
- Without credentials/sandbox access: say payments are **not implemented/verified**, never "ready".

## Performance & security

- Product images via CDN with responsive `srcset`; LCP = main product image, `fetchpriority="high"`.
- Rate-limit cart/checkout endpoints; validate quantities; no secrets in client code (`STRIPE_SECRET_KEY` server-only, publishable key only in the client).

## Completion criteria

Sandbox purchase, decline, 3DS and refund paths tested end-to-end; webhook verified and idempotent; product pages pass structured-data validation; legal pages flagged to the client.

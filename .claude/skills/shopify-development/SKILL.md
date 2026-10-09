---
name: shopify-development
description: Shopify theme and headless storefront work — Online Store 2.0 themes with Liquid sections/blocks and Shopify CLI, theme check, metafields/metaobjects, Storefront API (Hydrogen or Next.js) basics, checkout constraints, apps vs custom code, performance and SEO on Shopify. Use for Shopify stores. Requires Shopify CLI + a store/dev store (external).
---

# Shopify development

## Purpose

Build or customize Shopify stores within the platform's rules: themes that merchants can
edit in the theme editor, data in metafields, checkout left to Shopify.

## When to activate

Client sells on Shopify or chose it (`ecommerce-development` decision); theme customization; headless storefront.

## Why not the official Shopify AI Toolkit skill

`Shopify/shopify-ai-toolkit` was reviewed (2026-10-09) and **not vendored**: its skill registers a PostToolUse hook that posts telemetry to `shopify.dev/mcp/usage` and asks the agent to send the user's prompt (base64) with each validation call. shopify.dev is also blocked in this sandbox. Use the official docs at shopify.dev when network allows.

## Procedure — themes (Online Store 2.0)

1. **Tooling**: `npm i -g @shopify/cli` → `shopify theme dev --store <store>.myshopify.com` (live preview with hot reload), `shopify theme pull/push`, `shopify theme check` (linter). Work on an unpublished theme copy, never the live theme.
2. **Start from Dawn/Horizon** (Shopify reference themes) unless the client has a theme; keep upgrades possible.
3. **Structure**: `layout/theme.liquid`, `templates/*.json` (JSON templates referencing sections), `sections/*.liquid` with `{% schema %}`, `blocks/`, `snippets/`, `assets/`, `locales/ro.json`.
4. **Section with settings** (merchant-editable, no hard-coded copy):
   ```liquid
   <section class="usp">
     <h2>{{ section.settings.heading | escape }}</h2>
     {% for block in section.blocks %}<p {{ block.shopify_attributes }}>{{ block.settings.text }}</p>{% endfor %}
   </section>
   {% schema %}
   { "name": "USP list", "settings": [{ "type": "text", "id": "heading", "label": "Heading", "default": "De ce noi" }],
     "blocks": [{ "type": "usp", "name": "USP", "settings": [{ "type": "text", "id": "text", "label": "Text" }] }],
     "presets": [{ "name": "USP list" }] }
   {% endschema %}
   ```
5. **Custom data**: metafields/metaobjects (Settings → Custom data) for specs, ingredients, size guides — bind them to section settings via dynamic sources instead of hard-coding.
6. **Images**: `{{ image | image_url: width: 1200 | image_tag: widths: '400, 800, 1200', sizes: '(min-width: 990px) 50vw, 100vw', loading: 'lazy' }}`; LCP image `loading: 'eager', fetchpriority: 'high'`.
7. **Performance**: minimize app embeds (each adds JS), defer non-critical scripts, avoid jQuery, check Online Store speed report + Lighthouse.
8. **SEO**: unique titles/descriptions per product/collection (Shopify fields), canonical handled by Shopify — avoid duplicate collection-product URLs in internal links (link to `/products/handle`), JSON-LD in theme validated with `structured-data`.
9. **Checkout**: not editable via theme; customizations through Checkout UI extensions (Plus) or apps.

## Procedure — headless

Storefront API (GraphQL) with a public Storefront access token (read scope only) from Hydrogen or Next.js; cart via Storefront Cart API; checkout redirects to Shopify-hosted checkout (`cart.checkoutUrl`). Static export can render catalog pages at build and rebuild on product webhooks.

## Failure prevention

- Editing the live theme directly.
- Hard-coded text the merchant can't change.
- Admin API tokens in the storefront (only Storefront tokens are public).
- Too many apps injecting scripts.

## Verification checklist

- [ ] `shopify theme check` → 0 errors.
- [ ] Theme preview URL tested with `site_qa.mjs --url <preview>` (pages: home, collection, product, cart).
- [ ] Merchant can edit every new section in the theme editor.
- [ ] Test order in a development store / Bogus Gateway.

## External dependencies

Shopify Partner account + development store or client store access, Shopify CLI (not installed here), network to `*.myshopify.com` and shopify.dev (blocked here).

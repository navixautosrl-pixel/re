---
name: woocommerce-development
description: WooCommerce stores on WordPress — setup checklist, product/variation data, block-based cart and checkout, payment gateways (Stripe/Netopia) in sandbox, shipping and tax for Romania/EU, HPOS-compatible customizations via hooks, performance and security hardening, and order-flow testing. Use for WooCommerce builds or fixes. WordPress core work → wordpress-router and wp-* skills.
---

# WooCommerce development

## Purpose

A WooCommerce shop that takes real orders reliably, is fast enough, legally complete,
and customized without editing plugin core files.

## When to activate

Client is on WordPress or picked WooCommerce for a shop; fixing an existing WooCommerce site.

## Procedure

1. **Triage first**: run `wp-project-triage` on the codebase; for a live site with WP-CLI: `wp plugin list`, `wp wc --info` (if WC-CLI available), PHP/WP/WC versions, theme type (block vs classic).
2. **Store settings** (WooCommerce → Settings): store address, currency RON/EUR, selling locations, prices entered incl./excl. VAT (be consistent), tax classes (19% standard RO VAT; reduced rates per product type — confirm with the client's accountant), weight/dimension units.
3. **Products**: simple vs variable (attributes → variations with own SKU/price/stock/image); SKU everywhere; descriptive alt text; categories as real landing pages with intro copy.
4. **Cart & Checkout**: use the **block-based** Cart/Checkout (default for new stores); extend via Store API / checkout block extensibility, not template overrides. Keep checkout fields minimal.
5. **Payments**: official gateway plugins only (WooPayments/Stripe, Netopia, PayPal); test mode first; never store card data; enable 3-D Secure.
6. **Shipping**: zones (RO, EU), methods (flat rate, free over X, local pickup), courier plugins (Sameday, FAN Courier, Cargus) if needed; show delivery estimates on product pages.
7. **Customizations**: in a small custom plugin (not `functions.php` of a theme that may change):
   ```php
   add_filter( 'woocommerce_add_to_cart_validation', function ( $passed, $product_id, $qty ) {
       if ( $qty > 10 ) { wc_add_notice( __( 'Maxim 10 bucăți per comandă.', 'shop' ), 'error' ); return false; }
       return $passed;
   }, 10, 3 );
   ```
   Declare HPOS compatibility: `\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );` and use `wc_get_order()` APIs, never direct `wp_posts` queries for orders.
8. **Legal (RO/EU, flag to client)**: Terms, Privacy, Cookies, returns policy (14 days), ANPC + SOL links in footer, company data (CUI, Reg. Com.), e-Factura invoicing integration (SmartBill/FGO plugins), consent checkbox for terms at checkout.
9. **Performance**: page cache that excludes cart/checkout/my-account; object cache (Redis) if host allows; image sizes regenerated; limit plugins (`wp-performance`).
10. **Security**: auto-updates for minor versions, strong admin passwords + 2FA, limit login attempts, disable XML-RPC if unused, regular backups (off-server).
11. **Structured data & feeds**: WooCommerce outputs Product schema; validate with `structured-data`; Google Merchant feed via official Google Listings & Ads or a feed plugin.

## Failure prevention

- Editing WooCommerce/theme core files → lost on update.
- Caching the cart/checkout → wrong carts across customers.
- Going live with gateways in test mode (or vice versa).
- Prices shown without clarity on VAT.

## Verification checklist

- [ ] Test orders: success, declined card, 3DS, bank transfer/COD → correct order statuses + emails (customer + admin).
- [ ] Refund from admin updates gateway and stock.
- [ ] Mobile checkout completes in Playwright at 375px; no console errors.
- [ ] Rich Results Test on a product page (live URL); Lighthouse mobile on home, category, product, checkout.

## External dependencies

A WordPress + WooCommerce environment (local `wp-env`/Docker, LocalWP, or hosting) and gateway sandbox accounts. In this sandbox (checked 2026-10-09): PHP 8.3 with `pdo_sqlite`/`mysqli` and Composer are present; WP-CLI 2.12 can be installed to `~/.local/bin` (phar verified against its published SHA-512); but **wordpress.org and downloads.wordpress.org are blocked** and the Docker daemon is not running, so WordPress core/plugins can't be downloaded — work here is limited to authoring and static review (`php -l` for syntax).

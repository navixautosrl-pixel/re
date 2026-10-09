---
name: html-css-javascript
description: "No-build websites in semantic HTML, modern CSS and vanilla JavaScript — document skeleton, landmarks, progressive enhancement, event delegation, IntersectionObserver reveals, accessible menus/dialogs without frameworks, and single-file deployment. Use for plain HTML sites (pattern: website-v2/) or JS without React."
---

# HTML · CSS · JavaScript (no build step)

## Purpose

Ship fast, robust pages where a framework would be overhead: one or a few `.html` files,
one stylesheet, a small script — the pattern of `website/`, `website-v2/`, `website-rbtpro/`.

## When to activate

- Brief is a single landing page / small static site and no build step is wanted.
- Adding behavior to an existing static site or a CMS theme without a bundler.
- Not for: component-heavy multi-page sites (→ `nextjs-site-architecture`).

## Procedure

1. **Skeleton** (every page):
   ```html
   <!doctype html>
   <html lang="ro">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>Primary query — Brand</title>
     <meta name="description" content="140–160 chars, page-specific">
     <link rel="canonical" href="https://example.ro/">
     <meta property="og:title" content="…"><meta property="og:image" content="https://example.ro/og.jpg">
     <link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
     <link rel="stylesheet" href="/css/site.css">
     <script src="/js/site.js" defer></script>
   </head>
   <body>
     <a class="skip" href="#main">Sari la conținut</a>
     <header>…<nav aria-label="Principal">…</nav></header>
     <main id="main">…</main>
     <footer>…</footer>
   </body></html>
   ```
   `defer` (not `async`) for scripts that touch the DOM; nothing render-blocking except CSS.
2. **Semantics before ARIA**: one `<h1>`, sequential headings, `<button>` for actions, `<a href>` for navigation, `<ul>` for lists of cards, `<form>` + `<label for>`, `<details>/<summary>` for disclosure, `<dialog>` for modals.
3. **Progressive enhancement**: the page is complete with JS disabled; JS adds behavior. Mark JS-dependent styles with a class set by the script: `document.documentElement.classList.add('js')` → `.js .reveal { opacity: 0 }` (so no-JS users never get hidden content).
4. **Event delegation** instead of one listener per element:
   ```js
   document.addEventListener('click', (e) => {
     const t = e.target.closest('[data-copy]');
     if (!t) return;
     navigator.clipboard.writeText(t.dataset.copy).then(() => announce('Copiat'));
   });
   ```
5. **Scroll reveals without scroll listeners**:
   ```js
   const io = new IntersectionObserver((entries) => entries.forEach((en) => {
     if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
   }), { rootMargin: '0px 0px -10% 0px' });
   if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
   else document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
   ```
6. **Accessible mobile menu** (no framework): `<button aria-expanded="false" aria-controls="menu">`; toggle `hidden` on the panel; Escape closes and returns focus to the button; menu is an overlay (`position:absolute; top:100%`) so opening/closing doesn't shift anchor targets (bug found on skill-atelier).
7. **Native dialog**: `dialog.showModal()` gives focus trapping, Escape and `::backdrop` for free; restore focus to the opener on `close`.
8. **Forms**: native constraint validation (`required`, `type=email`, `pattern`) + custom messages via `setCustomValidity`; see `form-validation` for submission back-ends on static hosting.
9. **Live announcements**: one visually hidden `<div role="status" aria-live="polite">` updated by an `announce()` helper.
10. **Assets**: images with `width`/`height`, `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP image; `<picture>` for AVIF/WebP (see `image-optimization`).

## Best practices

- One CSS file with `@layer reset, base, components, utilities`; tokens as custom properties (see `modern-css-layout`).
- Keep JS under ~10 KB unminified for a landing page; no jQuery for new work.
- Relative or root-relative URLs chosen to match the deploy path (subpath hosting breaks root-relative URLs).
- `<script type="module">` is deferred by default and lets you split files without a bundler.

## Failure prevention

- Content hidden by CSS that only JS un-hides → invisible for no-JS users and crawlers (use the `.js` class gate).
- `href="#"` buttons, `div onclick` → not keyboard accessible.
- Missing `<meta viewport>` → desktop layout on phones (a real bug in this repo's history).
- Inline `onclick=` attributes → blocked by a strict CSP.

## Verification checklist

- [ ] `node .claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir <site-folder>` → 0 critical (covers no-JS, reduced motion, overflow, SEO tags).
- [ ] Keyboard-only: Tab through header → menu → CTA → form; Escape closes overlays.
- [ ] `bash .claude/skills/web-quality-audit/scripts/analyze.sh <file.html>` (needs `jq`) — doctype/lang/viewport/alt smoke test.
- [ ] HTML validity: no duplicate `id`s (`document.querySelectorAll('[id]')` check in the QA run).

---
name: image-optimization
description: Image optimization for websites — bundled sharp script producing responsive AVIF/WebP(/JPEG) variants with picture markup, choosing widths and sizes, LCP image priority, lazy loading, width/height for zero CLS, SVG optimization, next/image under static export, and CMS image CDNs. Use whenever a site ships raster images or screenshots.
---

# Image optimization

## Purpose

Sharp images at the smallest bytes, the right size per viewport, and zero layout shift.

## When to activate

Adding photos/screenshots/illustrations; LCP is an image; Lighthouse flags image delivery.

## Procedure

1. **Source quality**: start from the largest clean original (no re-compressed JPEGs of JPEGs). Crop/art-direct first (`creative-direction` image direction).
2. **Generate variants** (bundled; needs `npm i -D sharp` in the project — verified sharp 0.35 installs prebuilt binaries from npm here):
   ```bash
   node .claude/skills/image-optimization/scripts/optimize_images.mjs raw/photos --out public/img --widths 480,960,1440,1920 --sizes "(min-width: 900px) 50vw, 100vw"
   ```
   Prints per-variant sizes and a `<picture>` block with AVIF + WebP srcsets, `width`/`height`, `loading="lazy"`. Never upscales; strips EXIF (privacy: GPS!).
3. **`sizes` must match the layout** (how wide the image renders at each breakpoint), otherwise the browser downloads the wrong variant.
4. **LCP image**: `loading="eager" fetchpriority="high" decoding="async"`; consider `<link rel="preload" as="image" imagesrcset=… imagesizes=…>` if discovered late. Never lazy-load the LCP image.
5. **Dimensions**: always `width`/`height` attributes (or CSS `aspect-ratio`) → CLS 0.
6. **Next.js**: with `output: "export"`, `images.unoptimized: true`; use the script's `<picture>` (or `next/image` with pre-generated `srcSet` via a custom loader). Under a subpath, prefix URLs with `withBasePath()` and avoid `priority` (CLAUDE.md gotcha).
7. **SVG**: icons/illustrations as SVG; optimize with `npx svgo -i in.svg -o out.svg --multipass`; inline small icons, `<img>` for large decorative SVGs; `aria-hidden` or `<title>` as appropriate.
8. **Formats**: AVIF first (smallest), WebP fallback, JPEG only for very old clients (`--jpeg`). PNG only for screenshots that need lossless (and even then try AVIF/WebP at high quality).
9. **CMS/CDN images**: request explicit width/format (`?w=960&fm=webp&q=75` style params) rather than originals.
10. **Background images**: `image-set()` in CSS with type(); keep decorative only.

## Budgets (starting points)

Hero/LCP ≤ ~150–200 KB at mobile width; content images ≤ 100 KB; total image bytes on first view ≤ ~500 KB.

## Failure prevention

- 4000px camera originals served to phones.
- `loading="lazy"` on the hero.
- Missing alt text, or alt text that's a filename. Decorative → `alt=""`.
- Text baked into images (not translatable, not accessible).

## Verification checklist

- [ ] Script output saved (sizes per variant).
- [ ] `site_qa.mjs` → 0 images without alt/dimensions.
- [ ] Network check at 375px: the browser fetched the ~480/960 variant, not the largest.
- [ ] Lighthouse: no "properly size images"/"modern formats" findings; LCP image has fetchpriority high.

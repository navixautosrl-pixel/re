---
name: premium-typography
description: Typography as the main premium signal — choosing and pairing typefaces for a brand, fluid type scales, variable-font axes, line length and rhythm, OpenType features, Romanian diacritics, self-hosting/subsetting and font-loading without layout shift. Use when picking fonts, building a type scale, or when text looks generic, cramped or shifts on load.
---

# Premium typography

## Purpose

Most "premium" perception comes from type: scale contrast, spacing, and a face that
belongs to the subject. This skill turns that into decisions and checks.

## When to activate

Creative-direction stage (choose faces), implementation (scale, CSS), polish (critique), any font-related CLS/LCP issue.

## Procedure

1. **Choose by subject, not popularity**: list 3 qualities from `creative-direction` (e.g. "mechanical, precise, warm"). Shortlist faces whose construction matches (geometric/grotesk/humanist/slab/serif/mono-for-code-only). Reject the framework default (Inter/Geist/Roboto) unless it is genuinely right — say why.
2. **Check before committing**: Latin Extended (ă â î ș ț with comma-below, Ă Â Î Ș Ț), weights/axes needed, true italics if used, tabular numerals for prices/tables (`font-variant-numeric: tabular-nums`), licence (OFL/Apache via `@fontsource`), file size.
3. **Pairing**: one display + one text face, or one variable family used at contrasting settings (skill-atelier: Archivo `wdth 125%/800` display vs `wdth 72%/650` labels vs normal text). Never three unrelated families.
4. **Scale** — fluid, few steps, big jumps at the top:
   ```css
   --step-0: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);   /* body */
   --step-1: clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem);  /* lead */
   --step-3: clamp(1.9rem, 1.4rem + 2.2vw, 3.1rem);    /* h2 */
   --step-5: clamp(2.6rem, 1.5rem + 5.4vw, 6.4rem);    /* hero */
   ```
   Hierarchy from size contrast first, weight second, color last.
5. **Rhythm**: body `line-height` 1.5–1.65; headings 0.95–1.15 (tighter as size grows); `letter-spacing` slightly negative on large display (-0.01 to -0.03em), never tracked-out ALL CAPS labels everywhere (CLAUDE.md "never").
6. **Measure**: body 45–75ch (`max-width: 65ch`); `text-wrap: balance` on headings, `pretty` on paragraphs; avoid orphans in hero lines with deliberate line breaks only when the line breaks are part of the design (use spans per line + mask reveals, see `scroll-storytelling`).
7. **OpenType**: `font-feature-settings` only via high-level props first (`font-variant-ligatures`, `font-variant-numeric`, `font-kerning: normal`).
8. **Loading** (verified on skill-atelier):
   - `next/font/local` (or `<link rel=preload as=font crossorigin>`) for the 1–2 files used above the fold.
   - Subset variable fonts to used glyphs, keeping axes: `python3 -m fontTools.subset in.woff2 --unicodes=… --layout-features='kern,liga,calt' --flavor=woff2` (90 KB → 43 KB).
   - `font-display: swap` + metric-matched fallback (next/font does `size-adjust` automatically) keeps CLS ≈ 0 for **text** cuts — but verify under **real throttling** (`lh_runs.mjs --devtools`): automatic fallbacks are computed for the default instance, so a heavy, large display cut (e.g. wght 760 / opsz 96 / tight tracking) still reflows. On contact-sheet that measured CLS 0.236 with devtools throttling while simulated runs showed 0. Fix that worked: `display: "optional"` for the display face (still preloaded → normally ready for first paint; slow first visits keep the fallback instead of jumping) → CLS 0.000.
9. **Romanian**: always test a string like "Ștefan își țese în Brașov ÎNȚELEGEREA" at display and body sizes.

## Critique checklist (polish stage, on screenshots)

- Is there a clear typographic "voice" in the hero that a competitor's default stack wouldn't have?
- Do H2s feel like a different level from body at 375px (not just bold body)?
- Any line > 80ch on desktop? Any hyphen-less overflow of long words at 320px?
- Do numbers in prices/tables align (tabular)?

## Failure prevention

- Loading 6 weights "just in case" — use a variable font or only the weights used.
- Cedilla ş/ţ instead of comma-below ș/ț (grep `[şţŞŢ]`).
- Mono font used for every small label (CLAUDE.md "never") — mono only for code.
- `vw`-only font sizes → no zoom scaling (WCAG 1.4.4).

## Verification checklist

- [ ] Lighthouse CLS from fonts = 0 (layout-shift culprits not font-related).
- [ ] Network: ≤ 2 font files before LCP; each ≤ ~50 KB after subsetting.
- [ ] 200% zoom: no clipped or overlapping text.
- [ ] Diacritics render in the chosen face (screenshot the test string).

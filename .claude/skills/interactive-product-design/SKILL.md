---
name: interactive-product-design
description: Interactive product presentations and configurators on marketing sites — hotspots, before/after sliders, color/variant swatches, 360°/3D viewers, step-through demos, calculators — with URL-synced state, keyboard support, truthful content, and conversion hand-off. Use when a page needs to let visitors explore or configure a product or service.
---

# Interactive product design

## Purpose

Let visitors *try* the product on the page — and turn that engagement into a qualified
action — without sacrificing accessibility, speed, or honesty.

## When to activate

Product pages, service explainers (e.g. detailing packages, hosting plans), configurators, price calculators, before/after demonstrations.

## Pattern menu

| Need | Pattern | Tech |
|---|---|---|
| Explain parts of a product | hotspots on an image | absolutely-positioned `<button>`s + popover (`popover` attr or Radix Popover) |
| Show transformation | before/after slider | `<input type="range">` driving `clip-path: inset(0 calc(100% - var(--pos)) 0 0)` |
| Choose variant | swatches/radio group | `<fieldset>` + radio inputs styled as swatches; image swaps via `<picture>` |
| Rotate object | 360° image sequence or 3D | sprite/frames + range input, or `threejs-webgl` |
| Estimate price | calculator | form inputs → derived total; show formula & VAT honestly |
| Walk through a process | stepper / scroll scene | buttons + `aria-current="step"`, or `scroll-storytelling` |

## Procedure

1. **Define the question the interaction answers** ("Which finish fits my car?", "What does it cost?") and the hand-off CTA it leads to (prefilled form, add to cart).
2. **State model**: `{ variant, size, extras[] }` in one place; **sync to URL** (`?finish=matte&size=suv`) with `history.replaceState` / Next `useRouter().replace` so configurations are shareable and the CTA can pass them to the form.
3. **Native controls first**: radio groups, range inputs, buttons — they come with keyboard and screen reader support. Visual styling on top.
   ```html
   <fieldset><legend>Finisaj</legend>
     <label class="swatch"><input type="radio" name="finish" value="gloss" checked><span>Lucios</span></label>
     <label class="swatch"><input type="radio" name="finish" value="matte"><span>Mat</span></label>
   </fieldset>
   ```
4. **Before/after slider**: `<input type="range" aria-label="Compară înainte și după" min="0" max="100" value="50">` updating `--pos`; both images same `aspect-ratio`; keyboard arrows work by default.
5. **Hotspots**: each is a `<button aria-expanded aria-controls>` with visible label on focus; content also present as a list below for small screens.
6. **Calculators**: show line items, currency, VAT inclusion; disclaimers when estimates; never fake discounts. Results announced via `aria-live="polite"`.
7. **Performance**: preload only the default variant image; lazy-load others on interaction intent (hover/focus of the swatch).
8. **Hand-off**: CTA reads the configuration (`Programează: Polish + Coating, SUV`) and pre-fills the form; track `configure_*` and `generate_lead` events (see `analytics-tracking`).

## Failure prevention

- Custom div-based swatches without keyboard access.
- Configuration lost on refresh or when opening the form.
- Before/after images that aren't real before/after of the same object (misleading).
- Prices that differ between configurator, page copy and structured data.

## Verification checklist

- [ ] Playwright: change each control with keyboard only; URL updates; reload restores state; CTA carries config into the form.
- [ ] Screenshots of each variant at 375 and 1440.
- [ ] Screen reader names for every control (QA script "unnamed controls" = 0, axe clean).
- [ ] Prices consistent across UI, copy and JSON-LD (`structured-data` validator).

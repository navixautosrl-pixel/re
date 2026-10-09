---
name: website-copywriting
description: Website copywriting in Romanian and English — facts inventory, voice definition, headline and CTA writing, benefit-led service/product copy, microcopy (forms, errors, empty and success states), SEO-aware but natural copy, localization rather than literal translation, and proofreading (including correct Romanian diacritics ș/ț with comma-below). Use when writing or editing any visible text on a site. Never invents facts, numbers, testimonials, clients, or awards.
---

# Website copywriting (RO / EN)

## Purpose

Clear, specific, persuasive copy that sounds like *this* business and is true.

## When to activate

Content stage of every site; any time placeholder text, lorem, or generic filler exists; microcopy for forms and states.

## Workflow

1. **Facts inventory** (before writing a word): services, prices, location, hours, years active, guarantees, process steps, real reviews (verbatim + source), real numbers. Mark each ✓ confirmed / ? unknown. Unknowns become omissions or clearly tagged placeholders, never guesses.
2. **Voice in 3 adjectives + 1 "not"** (e.g. "precise, calm, proud of the craft — not salesy"). Romanian formality: choose *tu* (informal, common for lifestyle/B2C brands) or *dumneavoastră* (formal, common for B2B, legal, medical, premium-traditional) per brand, then never mix them on the site.
3. **Message hierarchy** per page from the `conversion-optimization` job sheet: promise → proof → process → price/offer → objections → CTA.
4. **Headlines**: outcome or sharp point of view, ≤ ~10 words, concrete nouns from the business. Test: could a competitor use it unchanged? Then rewrite.
   - ✗ "Soluții inovatoare pentru mașina ta" ✓ "Vopsea fără swirl-uri, garantat 24 de luni" (only if the guarantee is real)
5. **Body**: one idea per paragraph, 2–4 sentences, specifics over adjectives, "you" over "we". Benefits tied to features ("ceramic coating → apa alunecă, spălarea durează jumătate").
6. **CTAs**: verb + outcome ("Programează evaluarea", "Vezi prețurile", "Get a quote in 24h"). Same label for the same action site-wide.
7. **Microcopy**: field labels (not placeholder-only), helper text with format examples, error messages that say how to fix ("Introdu un număr de telefon de 10 cifre, ex. 0722 123 456"), success messages that say what happens next, empty states that point to the next action.
8. **SEO integration**: primary query in title, H1 (naturally), first paragraph, one H2; synonyms elsewhere. Read it aloud — if it sounds stuffed, it is.
9. **Localization**: write each language natively. Currency/date/phone formats per locale (RO: `1.250 lei`, `12 martie 2026`, `+40 7xx xxx xxx`; EN: `RON 1,250` or `€250`, `12 March 2026`). Don't translate brand terms the market uses in English (detailing, ceramic coating) if locals do.
10. **Proofread**: Romanian diacritics are ș ț (U+0219, U+021B, comma-below), not ş ţ (cedilla); quotes „…”; no double spaces; numbers and prices match `lib/site.ts` and JSON-LD.

## Never

Lorem ipsum in delivered work; invented testimonials, client logos, counts ("500+ clienți mulțumiți"), awards, years in business, or "#1"; superlatives without proof; fake urgency.

## Placeholder convention (when a fact is missing but the slot matters)

`<span class="example-tag">exemplu — de confirmat</span>` beside the value, and list it under "Assumptions & placeholders" in the delivery report.

## Verification

- `grep -RniE "lorem|ipsum|TODO|xxx" <src>` → nothing in shipped copy.
- Diacritics check: `grep -RnP "[şţŞŢ]" <src>` → nothing (cedilla forms).
- Every number/claim on the page appears in the facts inventory as ✓.

## Completion criteria

All copy written from confirmed facts, voice consistent, every CTA and state has microcopy, both languages native-quality, placeholders tagged and reported.

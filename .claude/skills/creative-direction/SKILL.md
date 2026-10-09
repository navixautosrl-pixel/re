---
name: creative-direction
description: Turns a brief into a distinctive, brand-specific visual concept — concept statement, moodboard-in-words, type pairing, palette, layout principles, image direction, design tokens, and a self-critique pass on rendered screenshots. Use at the start of any new site or redesign (before components are written) and again during visual polish. Complements ui-ux-pro-max (data lookup) and the frontend-design plugin (anti-slop guardrails); this skill is the decision process that uses them.
---

# Creative direction

## Purpose

Make the site look like it was designed *for this business* — not a template with
the logo swapped. Output is a short written direction that every later stage obeys.

## When to activate

- New site, redesign, or "make it look premium / less generic".
- Polish stage: critique screenshots against the direction.

## Workflow

1. **Mine the subject's world** (10 min, no tools needed). List 8–12 concrete nouns from the business itself: materials, tools, places, rituals, vocabulary, era, local context. *Car detailing →* clay bar, ceramic coating, water beading, paint-depth gauge, 2-bucket wash, garage LED strips. These are the source of every visual decision.
2. **Write a one-sentence concept** that names a tension, e.g. "Laboratory precision applied to something people love emotionally." Reject concepts that would fit any business ("modern and clean").
3. **Pick a direction archetype deliberately** (editorial, technical/instrument, tactile/material, cinematic, playful-graphic, brutalist-utility, luxury-quiet…) and state *why it fits the nouns from step 1*.
4. **Query `ui-ux-pro-max` fresh** for palette + font pairing candidates in that archetype:
   `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<industry> <archetype>" --design-system -p "<Brand>"`
   Treat results as candidates; choose and justify, don't paste.
5. **Typography**: one display face with character + one workhorse text face (or one variable family used at two very different settings). Check: Latin Extended for Romanian diacritics (ă â î ș ț — comma-below, not cedilla), variable axis availability, `@fontsource` package exists, licence (OFL preferred).
6. **Color**: build from the subject (a material, a light condition) — 1 ground, 1 ink, 1 signal color, 1–2 support tones. Verify contrast: body text ≥ 4.5:1, large text/UI ≥ 3:1, in both themes if dark mode exists.
7. **Layout principles**: grid (columns, gutters, max-width), rhythm (spacing scale), how hierarchy is expressed (scale contrast > weight > color), one signature layout move used 2–3 times, not everywhere.
8. **Image direction**: what photos show (real work, real people, real place), crop/treatment, what is *never* shown (stock handshake, generic laptop). If no real images exist, say so and plan illustration/typographic solutions rather than fake photography.
9. **Tokens**: hand off to `design-system` / `modern-css-layout` as CSS custom properties (`--color-*`, `--font-*`, `--step-*` fluid type, `--space-*`, `--radius-*` with **at least two radii by hierarchy**, `--ease-*`, `--dur-*`).
10. **Motion personality** in one line (e.g. "mechanical, precise, short overshoot-free eases") → feeds the CLAUDE.md motion storyboard.

## Deliverable (put in the plan or `DESIGN.md` in the project)

```
Concept: …
Subject nouns: …
Archetype: … because …
Type: Display … / Text … (diacritics ✓, variable ✓, @fontsource ✓)
Palette: ground … ink … signal … support … (contrast pairs: …)
Grid & rhythm: …
Signature move: …
Imagery: shows … / never …
Motion personality: …
Explicitly avoiding: (list the CLAUDE.md "never do these" items most tempting for this brief)
```

## Critique pass (polish stage)

Screenshot 375 / 768 / 1440. For each, answer in writing:
- Could this screenshot belong to a competitor with the logo swapped? If yes, what's generic?
- Is there one clear focal point per viewport?
- Does type scale contrast carry hierarchy, or is everything mid-size?
- Are there more than ~3 distinct card/box treatments? Same radius + shadow everywhere?
- Any CLAUDE.md "never do these" pattern present?
Fix, re-screenshot, repeat.

## Common failure modes

- Choosing fonts/colors first, concept after (backwards rationalisation).
- Defaulting to the previous project's look (see riviera-padel, pulsar-studio — don't re-skin them).
- Dark + neon / cream + serif + terracotta "premium" shortcuts.
- Gradients/glass with no subject reason.

## Completion criteria

Direction document exists, every token traces back to it, and the critique pass on real screenshots finds no generic patterns left.

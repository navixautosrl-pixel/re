---
name: micro-interactions
description: Micro-interactions and interaction states — hover, focus-visible, press, loading, success/error feedback, copy-to-clipboard, toggles, form field states, magnetic/cursor effects only when justified, timing and easing tokens, and keyboard/touch parity. Use when designing or polishing buttons, links, cards, inputs and feedback states.
---

# Micro-interactions

## Purpose

Every interactive element answers "can I use this?", "did it work?", "what now?" —
quickly, consistently, for mouse, touch and keyboard alike.

## When to activate

Component build and polish stages; when UI feels "dead" or inconsistent; when adding any async action (submit, copy, add to cart).

## State inventory (every interactive component)

| State | Requirement |
|---|---|
| default | affordance is visible without hover (underline, border, fill) |
| hover (`@media (hover:hover)`) | subtle change ≤ 150–200ms; never the only cue |
| focus-visible | 2px+ outline with ≥3:1 contrast, offset; same care as hover |
| active/press | 50–100ms response (`scale: .97` or darken) |
| disabled | not just lower opacity — `disabled` attr / `aria-disabled` + explanation nearby |
| loading | button keeps width, shows spinner/text "Se trimite…", `aria-busy` |
| success / error | visible text + `role="status"`/`aria-live`, not color only |

## Procedure

1. **Tokens** once: `--dur-micro: 150ms; --dur-ui: 240ms; --ease-out: cubic-bezier(.16,1,.3,1)`. Reuse everywhere.
2. **Buttons**:
   ```css
   .btn { transition: transform var(--dur-micro) var(--ease-out), background-color var(--dur-micro); }
   @media (hover: hover) { .btn:hover { transform: translateY(-1px); } }
   .btn:active { transform: translateY(0) scale(.98); }
   .btn:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
   @media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
   ```
3. **Async actions** — model state explicitly (`idle | pending | success | error`), keep layout stable, announce result:
   ```tsx
   <button disabled={pending} aria-busy={pending}>{pending ? "Se trimite…" : "Trimite cererea"}</button>
   <p role="status" aria-live="polite">{state === "success" ? "Mulțumim! Te sunăm în 24 h." : ""}</p>
   ```
4. **Copy to clipboard**: `navigator.clipboard.writeText` with try/catch fallback message ("Selectează și copiază"), label flips to "Copiat" for ~2s, live region announces (implemented in skill-atelier `CopyButton`).
5. **Form fields**: label above; focus ring; validate on blur, re-validate on input after first error; error text under field linked via `aria-describedby`; success tick optional.
6. **Cards/links**: whole-card click via a stretched link (`a::after { inset:0; position:absolute }`) rather than `onclick` on a div; hover lift ≤ 2px.
7. **Magnetic buttons / custom cursors**: only for portfolio/agency briefs that justify them; pointer-fine devices only (`@media (pointer: fine)`), use `gsap.quickTo` for performance, never hide the native cursor for form fields.
8. **Haptics/sound**: no.

## Failure prevention

- Hover-only reveals (info hidden on touch).
- Loading state that changes button width → layout jump.
- `outline: none` without replacement.
- Toasts that disappear before screen readers finish or that steal focus.
- Animations > 300ms on frequent actions (feels sluggish).

## Verification checklist

- [ ] Keyboard pass: every control reachable, visible focus (QA script "focus without outline" warnings = 0).
- [ ] Touch emulation (`hasTouch: true`, 375px): no hover-only content.
- [ ] Each async action tested for pending → success and pending → error (mock failure) in Playwright.
- [ ] Reduced motion: transitions off or instant.

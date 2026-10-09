---
name: rive-interactive-animation
description: Rive state-machine animations on websites with @rive-app/react-canvas — loading .riv files, useRive/useStateMachineInput and view-model data binding, wiring inputs to hover/click/scroll, layout/fit, lazy loading, static fallback, reduced motion and accessibility. Use for interactive illustrations, animated icons with states, or designer-made interactive scenes.
---

# Rive interactive animation

## Purpose

Interactive, stateful vector animation (designer-authored in Rive) controlled by the page,
at a fraction of video size — without blocking content or accessibility.

## When to activate

The design includes an illustration that reacts (hover, toggle, progress, form state), animated icon sets with states, or a character/mascot. For linear playback only, Lottie may be simpler (`lottie-animation`).

## Setup (verified: @rive-app/react-canvas 4.36 exports `useRive`, `useStateMachineInput`, `useViewModel`, `useViewModelInstance*`)

```bash
npm i @rive-app/react-canvas
```

```tsx
"use client";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export function SwitchIllustration({ on }: { on: boolean }) {
  const { rive, RiveComponent } = useRive({
    src: "/rive/switch.riv",
    stateMachines: "Main",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });
  const isOn = useStateMachineInput(rive, "Main", "isOn", on);
  if (isOn) isOn.value = on;           // sync React state → Rive input
  return <RiveComponent className="h-48 w-48" aria-hidden="true" />;
}
```
For files using **data binding** (newer Rive runtimes), use `useViewModel(rive)` + `useViewModelInstance(vm)` + typed hooks like `useViewModelInstanceBoolean("isOn", vmi)` instead of state-machine inputs — check which the .riv uses with the designer.

## Procedure

1. **Contract with the designer**: artboard name, state machine name, input names/types (boolean/number/trigger) or view-model properties, intrinsic size, and a static fallback frame (exported PNG/SVG).
2. **Lazy-load**: the runtime includes WASM (hundreds of KB). Load the component with `next/dynamic({ ssr:false })` and mount when near viewport; show the fallback image until `onLoad`.
3. **Size**: wrapper with fixed `aspect-ratio` → no CLS when the canvas mounts.
4. **Drive inputs from real UI**: buttons/links keep their own semantics; Rive reacts to them (don't make the canvas the only control).
5. **Reduced motion**: `autoplay: false` and render the end/rest state (or keep the fallback image) when `prefers-reduced-motion: reduce`.
6. **Off-screen**: `rive.pause()` when not intersecting, `rive.play()` when visible.
7. **Cleanup**: `useRive` cleans up on unmount; for the vanilla runtime call `rive.cleanup()`.
8. **Self-host** `.riv` files in `public/`; set long cache headers (they rarely change; version the filename).

## Failure prevention

- Canvas-only meaning (text inside the animation not available to screen readers) — duplicate key text in HTML.
- Wrong input/state-machine name → silent no-op; log `rive.stateMachineInputs("Main")` in dev.
- Mounting several Rive canvases on one screen on mobile → memory/CPU spikes; prefer one.

## Verification checklist

- [ ] Fallback image visible with JS off and under reduced motion (QA script screenshots).
- [ ] Playwright: trigger the UI control → canvas pixels change (compare two `locator.screenshot()` buffers).
- [ ] Network: runtime + .riv load only after the section approaches; sizes recorded.
- [ ] No CLS on mount (Lighthouse layout-shift audit).

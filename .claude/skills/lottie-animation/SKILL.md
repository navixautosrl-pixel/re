---
name: lottie-animation
description: Lottie / dotLottie animations on websites with @lottiefiles/dotlottie-react — choosing .lottie over JSON, optimizing exports, autoplay vs play-on-view, controlling playback via dotLottieRefCallback, layout and sizing, lazy loading, pause controls, reduced motion and fallbacks. Use for After Effects–made animations, animated illustrations or icons.
---

# Lottie animation

## Purpose

Designer-made vector animation that is small, lazy, pausable and accessible.

## When to activate

The design ships an After Effects/Lottie animation, animated icons or illustrations with linear (non-interactive) playback. Interactive state machines → consider `rive-interactive-animation` (dotLottie also supports state machines via `stateMachineId`).

## Setup (verified: @lottiefiles/dotlottie-react 0.20; props include `src`, `data`, `autoplay`, `loop`, `speed`, `mode`, `layout`, `renderConfig`, `playOnHover`, `stateMachineId`, `themeId`, `dotLottieRefCallback`)

```bash
npm i @lottiefiles/dotlottie-react
```

```tsx
"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
import { useEffect, useRef, useState } from "react";

export function ProcessAnimation() {
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!player || !box.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // stays on first frame
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? player.play() : player.pause()));
    io.observe(box.current);
    return () => io.disconnect();
  }, [player]);
  return (
    <div ref={box} className="aspect-[4/3] w-full">
      <DotLottieReact src="/lottie/process.lottie" loop autoplay={false} dotLottieRefCallback={setPlayer} renderConfig={{ devicePixelRatio: 1.5 }} />
    </div>
  );
}
```

## Procedure

1. **Format**: prefer `.lottie` (zipped JSON + assets, typically much smaller) over raw `.json`; convert with LottieFiles tools if needed.
2. **Optimize the export**: no embedded raster images (or compressed WebP), no unused layers/precomps, frame rate ≤ 30 for UI, shapes over masks/mattes where possible. Budget: icons < 30 KB, illustrations < 150 KB.
3. **Lazy**: `next/dynamic({ ssr:false })` + mount near viewport; reserve space with `aspect-ratio` (no CLS).
4. **Playback**: autoplay only above the fold *and* only when motion is allowed; otherwise play on view (above) or on user action. Loops > 5s need a pause button (WCAG 2.2.2) — wire it to `player.pause()/play()`.
5. **Fallback**: static first/last frame as SVG/AVIF for no-JS; decorative animations `aria-hidden="true"`; informative ones get adjacent text.
6. **Cap rendering cost**: `renderConfig={{ devicePixelRatio: 1–1.5 }}` on large animations.

## Failure prevention

- 2 MB JSON with embedded PNGs.
- Autoplay loops everywhere → distraction + CPU.
- Text baked into the animation that isn't in the HTML.
- Several large Lotties playing simultaneously on mobile.

## Verification checklist

- [ ] File sizes within budget (`ls -la public/lottie`).
- [ ] Off-screen → paused (check `player.isPlaying` via `page.evaluate` or CPU trace).
- [ ] Reduced motion → static frame; no-JS → fallback visible.
- [ ] Pause control works by keyboard for loops > 5s.

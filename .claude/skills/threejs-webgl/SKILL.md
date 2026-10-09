---
name: threejs-webgl
description: "Three.js and React Three Fiber for websites — when 3D is justified, R3F scene setup in Next.js (client-only, lazy), GLTF/Draco/KTX2 assets, lighting and materials, drei helpers, scroll-linked cameras, frameloop on demand, DPR caps, mobile fallbacks, and disposal. Use for 3D heroes, product viewers, shaders or particles. Decision/fallback overview: interactive-visuals."
---

# Three.js / WebGL / React Three Fiber

## Purpose

Real-time 3D that serves the subject, loads after the content, and doesn't melt phones.

## When to activate

Product that is physically 3D (object, packaging, device, architecture), data or concept that is spatial, or a brief explicitly requiring WebGL — and only after `interactive-visuals` says 3D is justified.

## Setup (verified versions on npm 2026-10: three 0.186, @react-three/fiber 9.8, @react-three/drei 10.7)

```bash
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```

```tsx
// components/visuals/ProductScene.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

function Model() {
  const { scene } = useGLTF("/models/product.glb"); // Draco/meshopt-compressed
  return <primitive object={scene} />;
}

export default function ProductScene() {
  return (
    <Canvas dpr={[1, 1.75]} frameloop="demand" camera={{ position: [0, 0.6, 3], fov: 35 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <Model />
        <Environment preset="studio" />
        <ContactShadows position={[0, -0.8, 0]} opacity={0.35} blur={2.4} />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
useGLTF.preload("/models/product.glb");
```

```tsx
// page (Server Component): never on the LCP path
const ProductScene = dynamic(() => import("@/components/visuals/ProductScene"), { ssr: false, loading: () => <Poster /> });
```

## Procedure

1. **Poster first**: render/screenshot the scene to an AVIF poster; that is the LCP element, the no-JS/no-WebGL/reduced-motion fallback, and the mobile default if needed.
2. **Assets**: export GLB from Blender; compress `npx --yes @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp` (CLI 4.5) (or `meshopt`); textures ≤ 2048px; hero object ≲ 100k triangles, file ≲ 1–2 MB.
3. **Mount lazily**: IntersectionObserver → mount the dynamic component when within ~1 viewport; skip if `prefers-reduced-motion: reduce`, `!WebGLRenderingContext`, or `navigator.hardwareConcurrency <= 4` on small screens (show poster).
4. **Render on demand**: `frameloop="demand"` + `invalidate()` when something changes; for continuous animation, pause when off-screen (`frameloop` state toggled by IO) and on `visibilitychange`.
5. **Scroll-linked camera**: drive a value from GSAP ScrollTrigger (or `useScroll` from drei inside `<ScrollControls>`) and `invalidate()`; never read `window.scrollY` every frame.
6. **Interaction & a11y**: canvas is `aria-hidden` if decorative; for product viewers provide visible buttons ("Rotește stânga/dreapta", color swatches) that work by keyboard and update the scene; text alternative describing the product.
7. **Shaders**: keep uniforms updated via refs in `useFrame((state, delta) => …)`; avoid allocating objects inside `useFrame`.
8. **Disposal**: R3F disposes on unmount; for manual three.js call `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()`.

## Failure prevention

- Canvas in the SSR/LCP path → multi-second LCP on mobile.
- `dpr` uncapped on 3x phones → 9× pixels.
- Continuous 60fps loop on a static scene → battery drain, INP regressions.
- Uncompressed 20 MB GLB; textures 4096² "just in case".

## Verification checklist

- [ ] Lighthouse mobile: LCP element is the poster/text; TBT not regressed vs. page without the scene (measure both).
- [ ] Chromium with `--disable-webgl` → poster shown, no errors.
- [ ] `reducedMotion: 'reduce'` → poster or static frame; no rAF loop.
- [ ] Network: GLB not requested until the section approaches; total 3D payload recorded.
- [ ] Keyboard controls change the view; screenshot before/after.

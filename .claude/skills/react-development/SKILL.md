---
name: react-development
description: Correct React 19 component code — state placement, derived values instead of effects, when useEffect is right, keys, forms and useActionState, hydration-safe rendering, Server vs Client Components, and hooks lint. Use when writing or debugging React components. Performance rules → vercel-react-best-practices; component API design → vercel-composition-patterns.
---

# React development (correctness)

## Purpose

Components that render the same on server and client, don't re-render or re-fetch
needlessly, and don't fight React. Performance and API-design depth live in the two
vendored Vercel skills; this skill is the day-to-day correctness checklist.

## When to activate

Writing/reviewing `.tsx` components, a hydration warning, "setState in effect" lint errors, stale state bugs.

## Procedure

1. **Decide where state lives**: URL (filters, tabs that should be shareable) → server data (fetched in a Server Component) → local `useState` → lifted to the nearest common parent. Avoid global stores for page-local UI.
2. **Derive, don't sync**: if a value can be computed from props/state, compute it during render (`useMemo` only if expensive). `useEffect(() => setX(f(y)), [y])` is a bug pattern.
3. **Effects are for synchronizing with outside systems** (subscriptions, DOM APIs, timers, non-React widgets like GSAP). Every effect returns a cleanup when it subscribes/creates something.
4. **Hydration-safe**: render output must not depend on `window`, `Date.now()`, `Math.random()`, or `localStorage` during the first render. To branch on "is client", use:
   ```ts
   const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
   ```
   (lint-clean replacement for `useEffect(() => setMounted(true), [])` — used in skill-atelier's ToolWall).
5. **Keys**: stable IDs from data, never array index for lists that reorder/filter (breaks AnimatePresence and input state).
6. **Forms (React 19)**: `<form action={fn}>` + `useActionState` for pending/error state; `useFormStatus` in the submit button. Client-only sites: controlled inputs only where you need live validation; otherwise read `FormData` on submit.
7. **Server vs Client Components (Next)**: default Server; `'use client'` only on the interactive leaf; pass serializable props; never import server-only modules (fs, secrets) into client files (`import "server-only"` guard).
8. **Refs & imperative libraries**: `useRef` for DOM nodes; initialize third-party libraries in an effect, keep their instance in a ref, destroy in cleanup.
9. **Context**: split by concern; memoize the value object; don't put fast-changing values in a context consumed widely.
10. **Lint**: `eslint-plugin-react-hooks` (included in `eslint-config-next`) — treat its errors as bugs (it caught a setState-in-effect in skill-atelier).

## Best practices

- Small components with one reason to change; compound components over boolean-prop explosions (see `vercel-composition-patterns`).
- Event handlers named `onX` in props, `handleX` inside.
- Accessibility first-class: real `<button>`, labels, `aria-*` only when semantics can't express it.
- Error boundaries (`error.tsx` in Next) around data-dependent sections; loading UI with `loading.tsx` or Suspense.

## Failure prevention

- Infinite render loops from effects that set state they depend on.
- Hydration mismatch warnings ignored → whole subtree re-renders on client, layout flash.
- Objects/arrays created inline as props to memoized children → memo useless.
- Fetching in `useEffect` on a Next page when a Server Component could fetch at build/request time.

## Verification checklist

- [ ] `npx eslint .` clean (react-hooks rules on).
- [ ] Browser console has no hydration or key warnings (QA script reports console errors).
- [ ] React DevTools / interaction test: filters and forms keep state correctly across re-renders.
- [ ] `npx tsc --noEmit` clean.

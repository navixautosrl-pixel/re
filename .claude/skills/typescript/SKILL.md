---
name: typescript
description: TypeScript for website and app code — strict tsconfig, typing React props and JSON data, narrowing and discriminated unions, runtime validation at boundaries with zod, avoiding any/as casts, and running tsc as a gate. Use when writing or reviewing .ts/.tsx, fixing type errors, or typing external data.
---

# TypeScript

## Purpose

Types that catch real bugs at the boundaries (props, JSON, forms, APIs) without
ceremony — and a `tsc` gate that blocks broken builds.

## When to activate

Any `.ts`/`.tsx` work; a build failing on types; typing data that comes from outside (CMS, API, form, JSON file).

## Procedure

1. **Strict config** (Next.js scaffolds this; verify):
   ```json
   { "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true, "noImplicitOverride": true,
     "exactOptionalPropertyTypes": false, "moduleResolution": "bundler", "resolveJsonModule": true, "skipLibCheck": true } }
   ```
   `noUncheckedIndexedAccess` makes `arr[i]` possibly `undefined` — catches real off-by-one bugs.
2. **Props**: plain object types; children as `React.ReactNode`; no `React.FC`.
   ```tsx
   type CardProps = { title: string; href?: string; tone?: "plain" | "signal"; children?: React.ReactNode };
   export function Card({ title, href, tone = "plain", children }: CardProps) { … }
   ```
3. **Model data with unions, not optional soup**:
   ```ts
   type FormState = { status: "idle" } | { status: "sending" } | { status: "error"; message: string } | { status: "sent" };
   ```
   Then `switch (s.status)` with an exhaustive `default: s satisfies never`.
4. **Validate at the boundary, infer the type**:
   ```ts
   import { z } from "zod";
   const Lead = z.object({ name: z.string().trim().min(2), phone: z.string().regex(/^\+?\d[\d\s]{8,}$/), service: z.enum(["coating", "polish"]) });
   type Lead = z.infer<typeof Lead>;
   const parsed = Lead.safeParse(Object.fromEntries(formData));
   if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };
   ```
   (zod 4: `z.flattenError(err)`; verify the API of the installed major with its `.d.ts`.)
5. **JSON imports**: `import data from "@/data/x.json"` gives an inferred type; for anything hand-edited, validate with zod at build time or assert a declared type once (`as Skill[]`) in a single module, never at each call site.
6. **`satisfies` for config objects** — keeps literal types and checks shape: `export const site = { … } satisfies SiteConfig;`
7. **Narrow, don't cast**: `if (el instanceof HTMLElement)`, `"key" in obj`, `Array.isArray`. `as` only for DOM queries you just verified or JSON you validated.
8. **Gate**: `npx tsc --noEmit` in CI and before every commit of TS changes (Next's build also type-checks — keep both green).

## Best practices

- `unknown` instead of `any` for untrusted input; then narrow.
- Export types next to the code that owns them; avoid a giant `types.ts`.
- Prefer string literal unions over `enum`.
- Use `import type` for type-only imports (helps bundlers and `verbatimModuleSyntax`).

## Failure prevention

- `// @ts-ignore` / `as any` to make a build pass → hides the bug; fix the type or the data.
- Types that lie about runtime data (API returns `null`, type says `string`) → validate.
- Duplicated hand-written types for API responses → derive from the schema (zod `infer`, generated types).

## Verification checklist

- [ ] `npx tsc --noEmit` exits 0.
- [ ] `grep -rnE "as any|@ts-ignore|@ts-expect-error" src` reviewed — each has a comment explaining why.
- [ ] Every external input (form, fetch, JSON, env) passes through a schema or explicit narrowing.

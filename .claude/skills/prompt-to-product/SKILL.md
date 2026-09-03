---
name: prompt-to-product
description: Turns a one-line brief ("build me a SaaS for appointment booking") into a structured PRODUCT SPEC before any code is written. Use this first for any new app-builder project, and whenever the brief is vague enough that database/auth/UI decisions would otherwise be guessed ad hoc.
---

# Prompt to Product

The first stage of the `app-builder` pipeline. Input: a short, often vague brief. Output: a structured spec other skills/agents can build against without re-deriving decisions mid-implementation.

## Why this exists

A one-line brief hides a dozen decisions (who's the user, what's free vs paid, what happens after signup, what "delete" means). Making those decisions implicitly, one file at a time, produces inconsistent apps — a pricing page that promises a tier the schema can't represent, a dashboard with no empty state because nobody decided what "zero appointments" looks like. Deciding them once, up front, in one place, is cheaper than re-deciding them per file.

## Process

1. **Read the brief literally first.** Don't pattern-match it to a generic template — "SaaS pentru programări" (appointments) is not the same product as "SaaS pentru CRM", even though both need auth+CRUD+billing.
2. **Fill in the spec below from the brief plus reasonable inference.** State assumptions explicitly rather than asking, per this repo's auto-mode default — only stop and ask when a choice is genuinely load-bearing and unguessable (e.g. "is this B2B or B2C" changes the entire data model and can't be inferred from "SaaS pentru programări").
3. **Keep it short.** This is a working document for the next 12 pipeline stages, not a pitch deck. A few lines per section is usually enough for an MVP.
4. **Hand off.** Once written, the spec is the input to `database` (entities → schema), `auth` (who logs in, roles), and `frontend-design`/UI (primary CTA, information architecture).

## Spec template

```
## Product: <name>

**One-liner**: <what it does, for whom>
**Target user**: <who signs up — role/segment, B2B vs B2C>
**Business objective**: <what "success" looks like for the business running this>
**Primary CTA**: <the one action the app wants a new visitor to take>

**Core entities** (→ feeds `database` skill):
- <Entity>: <key fields>, <relationships>
- ...

**MVP feature list** (in build order — earliest items unblock the rest):
1. ...

**User flows** (happy path only, MVP scope):
- Sign up → ...
- <Core action> → ...

**Auth model** (→ feeds `auth` skill):
- Who can sign up (open / invite-only)
- Roles, if any (e.g. owner vs staff vs customer)
- What's behind auth vs public

**Monetization** (if applicable, → feeds Stripe/backend):
- Free tier / paid tier(s), what gates each
- One-time vs subscription

**Explicitly out of scope for MVP**:
- <features that sound obvious but aren't being built yet>

**Placeholder content needed**: <anything the spec references that isn't real data yet — logo, pricing numbers, legal copy — marked as a placeholder per CLAUDE.md, never invented as fact>
```

## Handoff rule

Don't let implementation start from the brief directly — route it through this spec first, even for a "quick" app. The spec is what keeps `database`, `auth`, and `frontend-design` from independently guessing three different versions of the same product. Once approved (or, in auto mode, once written with assumptions flagged), pass it to `app-builder` to sequence the remaining stages.

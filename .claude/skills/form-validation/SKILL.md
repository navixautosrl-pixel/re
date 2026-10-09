---
name: form-validation
description: Website forms end to end — field design, accessible labels and errors, client + server validation with one zod schema, submission back-ends for static hosting (serverless function, PHP on cPanel, form services, WhatsApp hand-off), spam protection, success/error states, consent, and Playwright tests. Use for contact, booking, quote, and signup forms.
---

# Forms & validation

## Purpose

Forms that are easy to complete, accessible, protected from spam, and that *provably*
deliver the submission somewhere real.

## When to activate

Any form. Especially on static exports, where there is no server by default.

## Procedure

1. **Fields**: only what you'll use (name, phone or email, one qualifying question, message). Correct `type`/`inputmode`/`autocomplete` (`tel`, `email`, `name`, `postal-code`). Labels visible above fields; hints linked with `aria-describedby`.
2. **One schema, both sides** (zod):
   ```ts
   export const Contact = z.object({
     name: z.string().trim().min(2, "Scrie numele complet"),
     phone: z.string().trim().regex(/^(\+4|0)7\d{8}$/, "Număr de telefon RO, ex. 0722 123 456"),
     message: z.string().trim().max(2000).optional(),
     consent: z.literal("on", { message: "Bifează acordul pentru a fi contactat" }),
     company: z.string().max(0), // honeypot: must stay empty
   });
   ```
3. **Client UX**: validate on blur; after first error re-validate on input; on submit focus the first invalid field and show an error summary at the top for long forms. Errors in text (not color only), `aria-invalid="true"`, message element `id` referenced by `aria-describedby`.
4. **States**: idle → sending (button disabled, label "Se trimite…", width stable) → success (what happens next, by when) | error (what to do; keep the user's input). Announce via `role="status"`.
5. **Back-end options for static hosting** (pick, then document in the delivery report):
   | Option | Notes |
   |---|---|
   | Serverless function (Vercel/Netlify/Cloudflare) | validate with the same schema, rate-limit, send email (`email-automation`) or store |
   | PHP endpoint on cPanel (RobixHost) | `mail()`/PHPMailer via SMTP; validate + sanitize server-side; same-origin POST |
   | Hosted form service | quick; check GDPR/DPA and data location |
   | WhatsApp hand-off (`wa.me/40…?text=`) | no data stored by us; used on a site in this repo — be clear it opens WhatsApp |
6. **Server-side**: re-validate (never trust the client), honeypot + time-to-submit check (< 3s = bot), rate limit per IP, size limits, strip/escape before putting input into emails/HTML, return field errors as JSON.
7. **Consent**: separate, unticked checkbox for marketing; link to privacy policy; store consent with timestamp (see `gdpr-privacy`).
8. **Analytics**: `generate_lead` fired on *server-confirmed* success only (`analytics-tracking`).

## Failure prevention

- Placeholder-only labels; errors that clear the whole form.
- A form with no back-end that shows "success" anyway (fake functionality — CLAUDE.md forbids).
- Phone regex rejecting valid formats with spaces → normalize (remove spaces) before validating.
- CAPTCHA as first line of defense (hurts conversion and a11y) — honeypot + rate limit first.

## Verification checklist (Playwright)

- [ ] Empty submit → focus on first invalid field, each error visible and linked (`aria-describedby`).
- [ ] Invalid phone → specific message; valid → request sent once (intercept with `page.route` in tests).
- [ ] Server error mocked (500) → error state, input preserved.
- [ ] Honeypot filled → rejected server-side.
- [ ] Real end-to-end submission in staging reaches the inbox/endpoint (record evidence) — or the report says it was not tested and why.

---
name: email-automation
description: Transactional and marketing email for websites — form notifications, order/booking confirmations, newsletters with double opt-in, choosing a provider (Resend/Postmark/SES/SMTP), SPF/DKIM/DMARC, accessible responsive templates, unsubscribe and GDPR consent, deliverability and testing. Use when a site sends or collects email.
---

# Email automation

## Purpose

Emails that arrive (not in spam), say what happened, respect consent, and never leak data.

## When to activate

Contact/booking forms that notify the business or confirm to the visitor, e-commerce emails, newsletter signup, automated sequences.

## Procedure

1. **Classify**: *transactional* (confirmation, receipt, password reset — no consent needed, no marketing content) vs *marketing* (newsletter, promos — explicit opt-in, unsubscribe in every email). Use separate streams/domains (`mail.brand.ro` vs `news.brand.ro`).
2. **Provider**:
   | Need | Option |
   |---|---|
   | Developer API, transactional | Resend, Postmark, Amazon SES |
   | cPanel hosting only | hosting SMTP via PHP mailer, or an API from a tiny serverless function |
   | Newsletter + automation for the client to manage | MailerLite / Brevo / Mailchimp (client account) |
3. **DNS authentication** (client's DNS, needs access): SPF `v=spf1 include:<provider> ~all` (one SPF record only), DKIM CNAME/TXT from provider, DMARC `v=DMARC1; p=none; rua=mailto:dmarc@brand.ro` → tighten to `quarantine` after monitoring. Verify with provider's dashboard and `dig TXT brand.ro`.
4. **Send from server code only** (API keys never in the browser):
   ```ts
   // Route handler / server action (not available in static export → use a serverless function)
   const res = await fetch("https://api.resend.com/emails", {
     method: "POST",
     headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
     body: JSON.stringify({ from: "Programări <programari@mail.brand.ro>", to: [lead.email], reply_to: "contact@brand.ro",
       subject: "Am primit cererea ta", html, text }),
   });
   if (!res.ok) throw new Error(`email failed ${res.status}`);
   ```
5. **Templates**: table-free modern HTML is fine for most clients, but test in Gmail/Outlook; single column ≤ 600px, real text (not images of text), alt text, `lang`, plain-text alternative, dark-mode-safe colors, clear sender name.
6. **Newsletter signup**: double opt-in (confirmation link), consent text stating what/how often, store consent timestamp + source + IP, honor unsubscribe immediately (List-Unsubscribe header — required by Gmail/Yahoo for bulk senders).
7. **Protect forms**: honeypot + server-side rate limit + validation (`form-validation`); never echo user input into email subjects without sanitizing (header injection).
8. **Logging**: log message IDs and status, not message bodies/PII.

## Failure prevention

- Sending as `@gmail.com` from a server → spam/rejection; use the domain with SPF/DKIM.
- Two SPF records → both invalid.
- Pre-checked newsletter boxes / adding contact-form senders to marketing lists (GDPR violation).
- Notification emails containing full personal data forwarded to many inboxes.

## Verification checklist

- [ ] Test send to a seed inbox: lands in Inbox, headers show `spf=pass dkim=pass dmarc=pass`.
- [ ] Form submit (Playwright) → provider API called once (mock in tests), visitor sees success state.
- [ ] Unsubscribe link works; consent record stored.
- [ ] `grep -r "API_KEY" out/ .next/static` → nothing.

## External dependencies

Provider account + API key, DNS access for SPF/DKIM/DMARC; a server/serverless runtime (static export alone cannot send email).

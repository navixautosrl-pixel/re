---
name: gdpr-privacy
description: GDPR/ePrivacy for websites (Romania/EU) — data mapping, lawful bases, cookie consent that is actually opt-in, privacy and cookie policy contents, form consent and retention, processors and DPAs, third-party embeds and fonts, data subject requests, ANSPDCP context, and a technical audit of what the site sends where. Use for any site with forms, analytics, embeds, or e-commerce. Not legal advice.
---

# GDPR & privacy

## Purpose

Collect only what's needed, ask consent where the law requires it, tell people clearly,
and make the site's actual behavior match the policy. We implement; the client's legal
adviser signs off.

## When to activate

Forms, analytics/ads, chat widgets, embeds (YouTube, Maps), newsletters, e-commerce, any third-party script.

## Procedure

1. **Data map** (table in the project docs): what personal data (name, phone, email, IP, cookies), where collected, purpose, lawful basis (contract / legitimate interest / consent), where stored, processor (hosting, email provider, GA), retention, transfer outside EEA (and safeguard).
2. **Technical audit** — what the site really does before consent:
   ```bash
   node .claude/skills/gdpr-privacy/scripts/privacy_audit.mjs https://site.ro/                       # before consent
   node .claude/skills/gdpr-privacy/scripts/privacy_audit.mjs https://site.ro/ --accept "text=Accept"  # diff after accepting
   ```
   Lists third-party hosts (labelled: GA/GTM, Ads, Meta, Google Fonts CDN, YouTube, Maps, chat, session recording), cookies with domain/expiry, localStorage keys. Anything non-essential firing before consent → fix. (First real run: `website-v2/` loads Google Fonts from the CDN before consent.)
3. **Consent banner** (ePrivacy art. 5(3) + GDPR):
   - "Accept" and "Refuz" equally prominent on the first layer; "Settings" with categories; no pre-ticked boxes; no cookie walls for basic access.
   - Store the choice (+ timestamp, version); allow changing it from the footer ("Setări cookie").
   - Default-deny Consent Mode v2 for Google tags (`analytics-tracking`).
4. **Avoid needing consent** where possible: self-host fonts (`@fontsource`/`next/font`, no Google Fonts CDN), YouTube via click-to-load facade (`youtube-nocookie.com`), maps as static image + link until click, cookieless analytics if the client accepts its limits.
5. **Forms**: purpose stated next to the form; link to privacy policy; marketing consent = separate unticked checkbox; don't store more than needed; retention period (e.g. delete leads after 12 months if no contract); secure transport (HTTPS) and storage.
6. **Policies** (client provides/approves; we structure): Privacy policy (controller identity + CUI + contact, data categories, purposes & bases, recipients/processors, transfers, retention, rights + how to exercise, right to complain to **ANSPDCP**), Cookie policy (table of cookies: name, provider, purpose, duration, category).
7. **Processors**: DPAs with hosting/email/analytics providers; prefer EU data residency where available.
8. **Rights requests**: an email/form to request access/deletion; know where data lives (data map) to fulfil within 1 month.
9. **Security**: HTTPS, security headers, least-privilege access, no PII in logs/URLs/analytics params.

## Failure prevention

- Banner that loads GA before the click, or "Refuz" hidden in settings.
- Google Fonts/YouTube/Maps loaded on first paint (third-party requests with IP).
- Policy copied from another site that doesn't match actual tools.
- Contact-form leads added to newsletters.

## Verification checklist

- [ ] Before consent: 0 requests to analytics/ads/chat/embed hosts; only essential cookies (record the list).
- [ ] After "Accept": tags load; after "Refuz": still none; choice changeable from footer.
- [ ] Policy tables match the audit's actual cookies/hosts.
- [ ] Forms show purpose + policy link; marketing consent separate and unticked.
- [ ] Report states: implementation verified technically; legal compliance requires the client's adviser.

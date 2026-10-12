# Tractări auto — site cu calculator de preț

Static site (Next.js 16 export), 15 indexable pages: home (tractări auto București), calculator,
tarife, servicii and zone hubs, 8 landing pages (Centura București, A1 București–Pitești, Ilfov,
sectoarele 1–6, transport pe platformă, moto, mașini avariate, microbuze/autoutilitare), one guide,
contact, legal drafts. Page copy for landings: `src/data/landings.tsx`; keyword → URL map:
`docs/keyword-map.md`.
No backend, no cookies, no third-party scripts. Not published.

## Run

```bash
npm ci
npm run dev                 # http://localhost:3000
npm run build && npm run serve   # the real static export, http://localhost:3000
npm test                    # builds two exports, then 30 Playwright tests (pricing, calculator, Maps mock, a11y)
```

## Deploy (only after authorisation)

`npm run build` → upload the contents of `out/` to any static host (cPanel `public_html`,
Netlify, Vercel, Cloudflare Pages). For a subfolder: `BASE_PATH=/subfolder npm run build`.
Set `NEXT_PUBLIC_SITE_URL` (canonical/OG) and, at launch only, `NEXT_PUBLIC_SITE_INDEXABLE=true`
(until then the site is `noindex` + `Disallow: /`).

## Tarife — how the calculator prices

`src/config/pricing.ts`, formula in `src/lib/quote.ts`:

```
total = 1,25 × (km_Intra-City × tarif_Intra + km_Extra-City × tarif_Extra)
```

Reconstructed from six simulations of bursatractari.ro/calculator (București → Cluj-Napoca,
457 km = 427 Intra-City + 30 Extra-City) supplied by the client. The coefficient 1,25 is the only
value consistent with all six totals given that the reference displays its rates rounded to
one decimal. With the displayed rates our totals are within −0,6 % … +1,3 % of theirs
(`tests/pricing.unit.ts`):

| Vehicul | Intra | Extra | Referință | Calculator |
|---|---|---|---|---|
| Motocicletă | 3,3 | 2,3 | 1.823,34 | 1.847,63 |
| Hatchback | 4,4 | 2,8 | 2.462,45 | 2.453,50 |
| Sedan | 5,2 | 3,6 | 2.926,75 | 2.910,50 |
| SUV | 7,3 | 5,4 | 4.110,99 | 4.098,88 |
| Microbuz | 10,3 | 7,5 | 5.802,75 | 5.778,88 |
| Autoutilitară | 10,5 | 12,0 | 6.034,05 | 6.054,38 |

**To confirm** (one route can't show these):
1. Exact rates: one more simulation per vehicle on a different route (e.g. București → Ploiești)
   gives a second equation, so both unrounded rates can be solved exactly.
2. Which kilometres are "Extra-City": assumed = the first 30 km of every route. A short
   simulation (≈10 km inside one city) settles it. Change `PRICING.extraKm` or the split in `quote()`.
3. What the 1,25 coefficient is (TVA + commission?) — label `Coeficient tarifar` in the UI.
4. The surcharge for "Mașină avariată (roți blocate)" — `PRICING.damagedMultiplier` (now: "confirmat telefonic").
5. The 6th vehicle's name (the screenshot didn't show it) — set to "Autoutilitară".

## Distance: manual km or Google Maps

Without a key the visitor types the kilometres. With `NEXT_PUBLIC_GOOGLE_MAPS_KEY` set at build
time, the fields become address search (Places API (New) autocomplete) and the distance and
duration come from the Routes API. In Google Cloud: enable **Places API (New)** and **Routes API**,
restrict the key to **HTTP referrers** = your domain and to those two APIs, set a budget alert.
Google is contacted only after the visitor types an address (tested). The live Google calls were
only tested against mocked responses — verify with the real key before launch.

## What the business must supply (`src/config/site.ts`; dashed ✎ placeholders on the pages)

Company name (working name now: "Tractări Auto"), phone (enables Call), WhatsApp number (enables
the pre-filled message), e-mail, hours (e.g. non-stop — only if true), service area, legal name,
CUI, Reg. Com., address; payment methods; typical arrival time; real photos of the trucks;
legal review of the two legal drafts.

## SEO launch checklist (nothing here is done yet — needs the owner's accounts)

1. Real company name, phone, address in `src/config/site.ts` (enables the AutomotiveBusiness
   JSON-LD and the call buttons), then build with `NEXT_PUBLIC_SITE_INDEXABLE=true` and the real
   `NEXT_PUBLIC_SITE_URL`.
2. **Google Business Profile**, category "Serviciu de tractare", same name/phone/address as the site,
   service area București + Ilfov. This drives the map results for "tractări București".
3. Google Search Console: verify the domain, submit `sitemap.xml`, request indexing for the home
   page and the landing pages.
4. Same name/phone/address on Romanian directories (e.g. listafirme, paginiaurii, cylex) and
   social profiles → add their URLs as `sameAs`.
5. Ask real customers for Google reviews (never write or buy them).

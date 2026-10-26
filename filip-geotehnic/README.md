# FILIP GEOTEHNIC S.R.L. — site de prezentare

Site static, generat din `content.mjs` (texte), `partials/` (pagina principală, formular) și `assets/` (CSS, JS, `.htaccess`).

```bash
SITE_URL=https://domeniul-vostru.ro PHONE=+40722123456 PHONE_DISPLAY="0722 123 456" EMAIL=office@domeniu.ro node build.mjs
```

Rezultatul este în `dist/`: se urcă tot conținutul (inclusiv `.htaccess`) în `public_html`.

Fără `SITE_URL` se generează o previzualizare: toate paginile au `noindex`, `robots.txt` blochează indexarea
și nu există sitemap, ca site-ul să nu intre în Google cu adrese greșite.

Pagini: principală, 4 servicii, 6 zone (București, Ilfov, Popești-Leordeni, Voluntari, Otopeni, Chiajna) + pagina
zonelor, 4 ghiduri + pagina ghidurilor, întrebări frecvente, contact, confidențialitate, 404.
Date structurate: LocalBusiness (CUI, Reg. Com., localitate), Service, BreadcrumbList, FAQPage, Article.
Telefonul, e-mailul și adresa completă intră automat în pagini și în datele structurate după ce sunt completate.

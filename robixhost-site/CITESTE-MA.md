# RobixHost — site public (HTML static)

Site-ul se urcă pe hosting așa cum e: nu are pas de build, nu are Node,
nu are nimic de compilat. Copiezi conținutul acestui folder în
`public_html/` și gata.

## Ce trebuie configurat, o singură dată

### 1. Slug-urile produselor din WHMCS

Fișier: **`assets/js/robixhost-config.js`**

```js
var SLUGS = {
  nano: "",
  micro: "",
  ...
};
```

Așa cum e acum, fiecare buton „Comandă …" duce la pagina grupului de
gazduire din WHMCS:

```
https://clienti.robixhost.ro/index.php?rp=/store/web-hosting
```

Merge întotdeauna — clientul vede lista de produse și alege. Dacă pui
slug-ul fiecărui produs (îl iei din bara de adrese când deschizi produsul
în magazin, partea de după `/store/web-hosting/`), butonul duce direct la
produsul respectiv, cu ciclul de facturare deja selectat din comutatorul
Lunar/Anual de pe pagină.

Nimic altceva nu trebuie schimbat pentru WHMCS: adresa și numele grupului
sunt deja setate în același fișier.

### 2. URL-uri „curate" (fără `.html`)

Meniul face legături către `hosting`, `vps`, `contact` etc., fără
extensie. Pe Apache/cPanel adaugi în `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]
ErrorDocument 404 /404.html
```

Fără asta, linkurile din meniu dau 404.

### 3. Domeniul din datele SEO

`robots.txt`, `sitemap.xml` și eticheta `canonical` din fiecare pagină
folosesc `https://robixhost.ro`. Dacă site-ul stă pe alt domeniu sau pe
`www.`, caută și înlocuiește peste tot.

## Unde stau prețurile

Prețurile **nu** sunt în JavaScript. Sunt scrise direct în
`hosting.html`, în secțiunea `#preturi`, pentru că așa le citește Google
și așa pagina arată corect chiar dacă JavaScript-ul nu pornește.

Fiecare pachet are amândouă prețurile în pagină — cel lunar și cel anual.
Comutatorul doar arată unul și îl ascunde pe celălalt; nu calculează
nimic. Dacă schimbi un preț, schimbă-l în trei locuri din același card:
prețul lunar, prețul anual și textul „Facturat anual, X lei". Mai e o
copie a valorilor în blocul `application/ld+json` din `<head>`, pentru
Google.

## Animațiile

`assets/js/robixhost-animate.js` aplică animațiile pe toate paginile,
fără să fie nevoie de atribute în HTML. Se oprește complet dacă
utilizatorul are „reduce motion" activat în sistem.

## Ce a mai rămas de completat

- **Rețelele sociale** din subsol (`footer.html`) au `href="#"` — nu am
  avut adresele reale ale paginilor RobixHost. Pune-le sau scoate
  rândul; așa cum e acum, iconițele nu duc nicăieri.
- **Asteriscul de la „250 GB" din pachetul Enterprise** — în tabelul
  primit apărea `250 GB*`, dar fără explicația asteriscului. L-am scos,
  ca să nu inventez o condiție. Dacă însemna ceva (limită de fișiere,
  politică de utilizare), spune-mi și o adaug ca notă sub tabel.

# CreareWebsitePro — site gata de urcat

Conținutul acestui folder se copiază direct în `public_html/` pe
crearewebsitepro.ro. Nu are pas de build pe server, nu are nevoie de Node,
nu are bază de date.

## .htaccess

Fișierul `.htaccess` este inclus. Face două lucruri: forțează HTTPS și
servește `404.html` pentru adresele care nu există. Dacă găzduirea ta nu e
Apache (cPanel este), spune-mi și îți dau echivalentul.

## Ce trebuie completat înainte de lansare

### 1. Datele firmei în paginile legale — OBLIGATORIU

Termenii, politica de confidențialitate și obligațiile ANPC cer datele reale
de identificare ale comerciantului. Nu le am, așa că apar ca marcaje în
paranteze drepte: `[Denumire firmă] S.R.L.`, `[CUI/CIF]`, `[Nr. Registrul
Comerțului]`, `[Adresa sediului social]`, `[IBAN]`, `[Banca]`.

Cât timp nu sunt completate, cele trei pagini legale afișează un avertisment
roșu vizibil, ca să nu ajungă online arătând oficial fără să fie.

Se editează într-un singur loc, în sursă: `src/lib/constants.ts`, obiectul
`companyDetails`. După ce pui datele reale, treci `isPlaceholder` pe `false`
și avertismentul dispare.

**Textele sunt scrise de mine, nu de un jurist.** Acoperă ce trebuie acoperit
pentru o firmă de servicii din România și sunt gata de citit, dar dă-le un
ochi unui om de specialitate înainte să te bazezi pe ele.

### 2. Formularul de contact — trimite pe WhatsApp

La apăsarea butonului, mesajul îți ajunge pe WhatsApp prin CallMeBot, la
numărul `0773 938 355`. Cheia (`9102404`) e în `src/lib/contact.ts`.

**Două lucruri de știut, ca să nu fie surpriză:**

1. **Cheia e vizibilă în codul din browser.** Site-ul e static, nu are server
   unde s-o ascundă. Oricine deschide codul paginii o poate citi și îți poate
   trimite mesaje pe WhatsApp prin ea. Nu-i dă nimănui acces la nimic, dar e
   o portiță de spam. Rezolvarea, dacă devine o problemă: un mic releu (o
   funcție gratuită pe Vercel sau Cloudflare) care ține cheia la el — atunci
   se schimbă o singură constantă, `ENDPOINT`.

2. **Nu putem citi răspunsul lor.** CallMeBot nu trimite anteturi CORS, deci
   știm că cererea a plecat, nu că ei au livrat-o. De asta pagina de
   confirmare păstrează la vedere telefonul și emailul. Dacă CallMeBot
   respinge (cheie greșită, prea multe mesaje într-un minut), site-ul tot va
   spune „Mesajul a plecat”. **Testează o dată după ce urci site-ul** — e
   singurul mod de a fi sigur.

Nu am putut testa trimiterea reală de aici: ieșirea către `api.callmebot.com`
e blocată în mediul în care lucrez. Am verificat că cererea pleacă spre
adresa corectă, cu numărul, cheia și textul tău în ea.

### 3. Chatul live (Tawk.to)

Este montat, cu ID-ul tău (`6ab5b35a64e731344b0048a6`). Nu am putut verifica
din mediul de aici că fereastra se deschide, pentru că ieșirea către
`embed.tawk.to` e blocată în sandbox — am verificat că cererea pleacă spre
adresa corectă. Testează o dată după ce urci site-ul.

**Pornește la fiecare vizită**, cum ai cerut, ca să poți trimite mesaje
proactive. Asta înseamnă că Tawk primește IP-ul fiecărui vizitator și îi pune
cookie-urile lui la fiecare încărcare de pagină — așa că ambele politici sunt
scrise să spună exact asta: ce cookie-uri pune, pe ce durată, cine le
primește și cum poate cineva să le evite.

Varianta „pornește doar la click” e construită tot acolo și e la un cuvânt
distanță, dacă te răzgândești: în `src/components/shared/LiveChat.tsx`,
`const LOAD_ON = "load"` → `"click"`. Atunci apare în colț un buton desenat
local, iar Tawk se încarcă abia la apăsarea lui.

### 4. Analytics (opțional)

Nu e instalat niciun instrument de măsurare a traficului. Dacă vrei Google
Analytics sau Plausible, **nu-l pune direct în pagină**: ar porni înainte de
acordul vizitatorului, exact ce interzice legea. Instrucțiunile de montare
corectă, prin bannerul de cookie-uri, sunt comentate la finalul fișierului
`src/components/shared/CookieConsent.tsx`.

După ce îl adaugi, completează și secțiunea 2 din pagina `/cookies` cu numele
furnizorului și durata cookie-urilor lui.

## Ce s-a schimbat față de versiunea anterioară

- **Brand**: Pulsar Studio → CreareWebsitePro, peste tot (meniu, subsol,
  titluri, date structurate, imagine de social media).
- **Logo animat**: marcă proprie — un nucleu care emite inele, aceeași idee
  ca vizualul din hero, ca să fie un singur sistem vizual. Se desenează la
  încărcare și repetă emisia la hover. Se oprește complet dacă vizitatorul
  are „reduce motion” activat.
- **Contact**: email `robixhosting@gmail.com`, telefon `0773 938 355`,
  WhatsApp — în subsol, în secțiunea de contact și în datele structurate.
- **Pagini legale noi**: Termeni și condiții (15 secțiuni), Politica de
  confidențialitate (GDPR, 10 secțiuni), Politica de cookie-uri.
- **Banner de cookie-uri** cu categorii, „Refuz” la fel de vizibil ca
  „Acceptă toate”, alegere salvată 12 luni, redeschidere din subsol.
- **ANPC**: butoane SAL și SOL în subsol, obligatorii pentru comerț online.
- **Metode de plată**: Visa, Mastercard, transfer bancar, PayPal,
  criptomonede. Numerarul și ramburs-ul sunt marcate explicit ca neacceptate.
- **Chat live Tawk.to**, pornit la fiecare vizită (vezi mai sus).
- **Formularul trimite pe WhatsApp** prin CallMeBot, nu mai deschide clientul
  de email.
- **Bannerul de cookie-uri nu mai fură clicuri**: sub 1024px e o fereastră
  cu voal, peste 1024px un cartonaș în colțul din stânga-jos. Înainte se
  întindea pe toată lățimea și ateriza exact peste butonul „Cere o ofertă”
  din hero — clicul ajungea în banner, nu în buton.
- **SEO**: titluri și descrieri noi construite pe „creare website”, listă de
  cuvinte cheie reordonată, canonical și Open Graph pe domeniul nou, date
  structurate curățate (erau două noduri `WebSite` și două `FAQPage`
  duplicate), sitemap fără paginile `noindex`.

## Verificat

Chromium, 9 pagini × 9 lățimi de la 320px la 1920px: fără scroll orizontal,
fără erori de consolă, fără cereri eșuate. Verificate separat și: titlul,
meta description, canonical, `og:image`, iconițele, un singur `h1` pe pagină,
ordinea titlurilor, cele trei blocuri de date structurate, linkurile ANPC,
pictogramele de plată, linkurile `tel:`/`mailto:`, bannerul de cookie-uri
(apare, salvează, nu reapare, se redeschide din subsol) și randarea corectă
cu `prefers-reduced-motion`.

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

## Proiectele livrate

`baltalazaralexandria.ro` și `paradisultenilor.ro` apar **doar pe
`/creare-site/balti-de-pescuit/`**, nu pe pagina principală.

Motivul: două lucrări pe prima pagină se citesc ca „atât au livrat”. Aceleași
două, pe pagina scrisă pentru bălți de pescuit, se citesc ca „ăștia fac exact
asta”. Pe măsură ce livrezi în alte domenii, fiecare nișă își capătă propriile
proiecte — câmpul `proof` din `src/lib/niches.ts` leagă un domeniu de lucrările
reale din el. Nu-l completa cu un proiect dintr-un domeniu vecin; strică exact
efectul pentru care există.

Capturile sunt cele trimise de tine, de pe telefon, afișate ca atare — într-o
ramă de telefon, nu întinse pe lățimea unui card, ca să nu mintă despre ce ai
văzut. Stau în `public/previews/`. Când se schimbă site-urile, înlocuiește
fișierele cu aceleași nume.

Descrierile sunt scrise din ce se vede efectiv pe capturi: localitatea, tipul
de pescuit, cabanele, modul de rezervare, panoul de vreme. Nimic despre tarife
sau rezultate, pentru că nu apar acolo.

### Linkul din subsolul lor (fă-l tu, azi)

Ăsta e cel mai valoros lucru pe care îl poți face pentru clasare săptămâna
asta, și e gratis. Pune în subsolul ambelor site-uri:

```html
<p style="text-align:center;font-size:13px;opacity:.7;margin:16px 0">
  Site realizat de
  <a href="https://crearewebsitepro.ro/creare-site/balti-de-pescuit/"
     rel="noopener">CreareWebsitePro</a>
</p>
```

Linkul duce spre pagina de nișă, nu spre prima pagină: e mai relevant tematic
și e exact pagina pe care vrei s-o clasezi pe „creare site baltă de pescuit".
Fără `rel="nofollow"` — e un link editorial normal, pus de tine pe propriile
lucrări.

## Măsurare — de făcut prima dată, înaintea oricărui alt lucru

Fără ce urmează, nu se poate răspunde la întrebarea „de ce nu vine nimeni”.
„Nu apar deloc în Google”, „apar, dar nimeni nu dă click” și „intră lume, dar
nu mă contactează nimeni” arată identic din afară și au trei rezolvări
complet diferite.

### 1. Google Search Console — gratuit, obligatoriu

1. Intră pe `search.google.com/search-console` și adaugă
   `crearewebsitepro.ro`.
2. Alege metoda de verificare **HTML tag**. Îți dă ceva de forma
   `<meta name="google-site-verification" content="AbC123..." />`.
3. Copiază **doar partea dintre ghilimele** (`AbC123...`) în
   `src/lib/constants.ts`, la `analytics.searchConsoleVerification`.
4. Reconstruiește, urcă, apasă „Verify”.
5. La **Sitemaps**, trimite `https://crearewebsitepro.ro/sitemap.xml`.
6. La **URL Inspection**, lipește adresa paginii principale și apasă
   „Request indexing”. La fel pentru `/creare-site/`.

De aici afli pe ce cuvinte apari, pe ce poziție, câte afișări și câte clicuri
ai. Datele apar în 2–3 zile de la verificare și nu se pot recupera retroactiv
— de-asta merită făcut acum, nu peste o lună.

### 2. Verifică în 10 secunde dacă ești indexat

Caută în Google, exact așa:

    site:crearewebsitepro.ro

- **Apar pagini** → ești indexat. Lipsa traficului e o problemă de poziție,
  nu de indexare.
- **Nu apare nimic** → Google încă nu ți-a luat site-ul în evidență. E
  normal la un domeniu nou și se rezolvă cu pașii de mai sus.

### 3. Google Analytics — opțional, după Search Console

Dacă vrei să vezi și ce fac oamenii după ce ajung pe site, pune
identificatorul GA4 (`G-XXXXXXXXXX`) la `analytics.googleAnalyticsId`, în
același fișier. Se încarcă **numai după** ce vizitatorul acceptă din bannerul
de cookie-uri, cu IP anonimizat și fără semnale de publicitate. Pagina
`/cookies` își schimbă singură textul când îl completezi — nu trebuie să
editezi nimic acolo.

### 4. Profilul Google Business

Nu ține de site, dar pentru o firmă de servicii aduce des mai mult decât
SEO-ul în primele luni, și e gratuit: `business.google.com`.

## Ce s-a reparat la SEO-ul de pe pagină

Un audit al paginii principale a arătat o lipsă reală, nu una închipuită:

| Înainte | După |
|---|---|
| H1: „Construim site-uri care îți cresc afacerea." | H1: „Creare website pentru afaceri care cresc." |
| „creare website" apărea de **0 ori** în pagină | apare de **3 ori**, inclusiv în H1 |
| toate cele 8 H2-uri erau sloganuri | 7 din 8 descriu ce e în secțiune, cu cuvintele căutate |
| „România", „preț" — 0 apariții | prezente |

Titlul paginii (65 caractere) și descrierea (146) erau deja bune și au rămas
neatinse. Promisiunea din vechiul H1 nu s-a pierdut — a coborât în paragraful
de sub titlu, unde îi e locul.

**Despre meta `keywords`:** există în pagină, dar **Google o ignoră din
2009**. Nu are niciun efect asupra clasării. Am lăsat-o pentru că Bing se mai
uită ocazional la ea, însă nu te baza pe ea.

**Și o precizare cinstită:** asta nu e motivul pentru care nu a intrat nimeni
în prima săptămână. Era o problemă reală și merita reparată, dar nicio pagină
nu clasează un domeniu de șapte zile, oricât de bine ar fi scrisă. Cele două
lucruri sunt separate.

## Cât durează, realist

Un domeniu nou nu se clasează în zile. Ordinea obișnuită:

| Când | Ce se întâmplă |
|---|---|
| Zilele 1–14 | Google descoperă și indexează site-ul. Trafic: aproape zero. Normal. |
| Lunile 1–3 | Încep afișările pe căutări lungi și specifice („creare site baltă de pescuit”). Primele clicuri. |
| Lunile 3–6 | Paginile de nișă prind poziții reale. Cuvintele scurte și comerciale („creare website”) încă nu. |
| Luna 6+ | Termenii grei devin posibili — dar depind de vechimea domeniului și de linkuri către el, nu de cum arată site-ul. |

De asta paginile pe domenii sunt cea mai bună investiție din site-ul acesta:
„creare website” e disputat de zeci de agenții cu ani de vechime, pe când
„creare site pentru bălți de pescuit” aproape că nu are concurență. Căutările
lungi aduc mai puțini oameni, dar mult mai devreme — și pe aceia care știu
deja exact ce vor.

## Paginile pe domenii de activitate

Site-ul are acum, pe lângă pagina principală, **16 pagini de nișă** și o
pagină de index:

    /creare-site/                      index pe categorii
    /creare-site/balti-de-pescuit/
    /creare-site/terenuri-de-padel/
    /creare-site/baze-de-inot/
    /creare-site/terenuri-de-tenis/
    /creare-site/sali-de-fitness/
    /creare-site/detailing-auto/
    /creare-site/tractari-auto/
    /creare-site/service-auto/
    /creare-site/shaormerie/
    /creare-site/fast-food/
    /creare-site/restaurante/
    /creare-site/pensiuni-turistice/
    /creare-site/magazine-online/
    /creare-site/cabinete-stomatologice/
    /creare-site/saloane-de-infrumusetare/
    /creare-site/firme-de-constructii/

**De ce pagini separate, și nu secțiuni în pagina principală.** O pagină se
poate clasa pentru o singură intenție de căutare. „Creare site baltă de
pescuit” și „site pentru detailing auto” sunt două intenții diferite, cu
oameni diferiți în spate. Puse amândouă pe aceeași pagină, se anulează
reciproc: Google nu știe pe ce s-o claseze și n-o clasează pe niciuna. Puse
pe pagini separate, fiecare are titlu propriu, descriere proprie, un singur
H1 și un text care chiar răspunde la acea căutare.

**Riscul, și cum a fost evitat.** Paginile care diferă doar prin cuvântul
schimbat se numesc „doorway pages”, Google le tratează ca spam și poate
retrograda tot domeniul. De aceea fiecare pagină e scrisă separat: alte
probleme, alte secțiuni necesare, alte întrebări frecvente. Suprapunerea
maximă între oricare două pagini, măsurată pe vocabular, e de 32% — și aceea
între shaormerie și fast food, care chiar sunt înrudite.

**Cum adaugi o nișă nouă.** Tot conținutul stă în
`src/lib/niches.ts`. Copiezi o intrare, îi schimbi textele și apare automat
peste tot: în index, în sitemap, în legăturile dintre pagini. Scrie conținut
real pentru ea — o intrare copiată cu numele schimbat face rău, nu bine.

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
- **16 pagini pe domenii de activitate** plus un index (vezi mai sus).\n- **Chat live Tawk.to**, pornit la fiecare vizită (vezi mai sus).
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

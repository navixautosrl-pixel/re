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

### 2. Formularul de contact

Site-ul e static, deci nu are server care să primească formularul. Până acum
butonul de trimitere pur și simplu dădea eroare.

Acum funcționează așa: la trimitere, se deschide aplicația de email a
vizitatorului cu destinatarul, subiectul și toate câmpurile deja completate —
mai rămâne să apese „Trimite”. În pagina de confirmare are și varianta
WhatsApp, și numărul de telefon.

Când vrei un formular care trimite singur (fără să depindă de clientul de
email al vizitatorului), îți trebuie un endpoint: o funcție serverless,
Formspree, Web3Forms sau similar. Punctul de integrare e pregătit și comentat
în `src/lib/contact.ts` — se schimbă o singură funcție, restul paginii rămâne
neatins.

### 3. Chatul live (Tawk.to)

Este montat, cu ID-ul tău (`6ab5b35a64e731344b0048a6`). Nu am putut verifica
din mediul de aici că fereastra se deschide, pentru că ieșirea către
`embed.tawk.to` e blocată în sandbox — am verificat că cererea pleacă spre
adresa corectă. Testează o dată după ce urci site-ul.

**Se încarcă la primul click, nu la încărcarea paginii.** Butonul „Scrie-ne”
din colț e desenat de mine, local, și nu trimite nimic nicăieri; la click se
încarcă scriptul Tawk și fereastra lor se deschide imediat.

Am făcut așa pentru că eticheta Tawk pusă direct în pagină pornește la
fiecare vizită, trimite IP-ul fiecărui vizitator la Tawk și îi pune
cookie-uri proprii înainte să fi cerut ceva — ceea ce ar fi contrazis două
lucruri scrise negru pe alb în pagina `/cookies`: că niciun terț nu primește
IP-ul prin simpla vizitare, și că nimic în afara setării strict necesare nu
pornește fără acord. În plus, pagina se încarcă mai repede pentru cei care
nu deschid chatul.

Ambele politici sunt actualizate: Tawk.to e declarat explicit, cu ce
cookie-uri pune și pe ce durată.

**Dacă vrei să pornească la fiecare vizită** (ca să poți trimite mesaje
proactive): în `src/components/shared/LiveChat.tsx`, schimbă
`const LOAD_ON = "click"` în `"load"`. Atunci actualizează și secțiunea 2 din
`/cookies` — Tawk devine un terț activ pe fiecare pagină, nu unul pornit la
cerere.

Dacă scriptul e blocat (blocant de reclame), butonul nu rămâne blocat pe
„Se deschide…”: după 8 secunde spune ce s-a întâmplat și afișează emailul și
telefonul.

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
- **Chat live Tawk.to**, pornit la click (vezi mai sus).
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

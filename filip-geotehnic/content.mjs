/*
 * Conținutul site-ului FILIP GEOTEHNIC S.R.L.
 * Reguli: numai fapte verificabile despre firmă (denumire, CUI, Reg. Com., localitatea sediului);
 * fără prețuri, termene, statistici, clienți sau recenzii inventate. Informațiile tehnice sunt
 * generale (normative în vigoare) și formulate ca atare.
 */

export const COMPANY = {
  name: "FILIP GEOTEHNIC S.R.L.",
  short: "FILIP GEOTEHNIC",
  cui: "49960856",
  regCom: "J23/2975/2024",
  locality: "Popești-Leordeni",
  region: "Ilfov",
};

/* ---------------- Servicii ---------------- */
export const SERVICES = [
  {
    slug: "studii-geotehnice",
    nav: "Studii geotehnice",
    title: "Studii geotehnice București și Ilfov | FILIP GEOTEHNIC",
    description: "Studiu geotehnic pentru autorizația de construire în București și Ilfov: foraje, analize de laborator și recomandări de fundare. Cereți o ofertă.",
    h1: "Studii geotehnice în București și Ilfov",
    lead: "Studiul geotehnic descrie terenul de pe amplasament și stabilește condițiile de fundare. Fără el nu se poate obține autorizația de construire și nu se poate proiecta corect structura.",
    card: "Documentația care descrie terenul și stabilește condițiile de fundare, necesară pentru autorizarea construcției.",
    body: `
<h2>Ce este un studiu geotehnic</h2>
<p>Studiul geotehnic este documentația care arată <strong>ce se află sub construcția viitoare</strong>: din ce straturi este format terenul, ce grosime au, cât de rezistente și de compresibile sunt și la ce adâncime apare apa subterană. Pe baza acestor date, inginerul geotehnician recomandă adâncimea și tipul fundării, iar proiectantul de structură dimensionează fundațiile.</p>
<p>Studiul se întocmește pentru un amplasament și o construcție anume. Un studiu făcut pentru terenul vecinului sau pentru alt proiect nu poate fi folosit în locul lui.</p>

<h2>Când aveți nevoie de un studiu geotehnic</h2>
<ul>
  <li>pentru <strong>autorizația de construire</strong> a unei case, a unui bloc, a unei hale sau a unei clădiri de birouri;</li>
  <li>pentru <strong>extinderi, supraetajări și mansardări</strong>, unde trebuie verificat dacă terenul și fundațiile existente preiau încărcările noi;</li>
  <li>pentru <strong>consolidarea</strong> unei clădiri existente sau când apar fisuri care pot avea legătură cu terenul;</li>
  <li>pentru <strong>drumuri, platforme, parcări și rețele</strong> îngropate;</li>
  <li>înainte de a cumpăra un teren, ca să știți din timp dacă fundarea va fi simplă sau costisitoare.</li>
</ul>
<p>Detalii despre fiecare situație găsiți în ghidul <a href="/ghid/cand-este-necesar-un-studiu-geotehnic/">Când este necesar un studiu geotehnic</a>.</p>

<h2>Ce conține studiul geotehnic</h2>
<ul>
  <li>descrierea amplasamentului și a lucrărilor de investigare executate (foraje, penetrări);</li>
  <li>stratificația terenului, cu fișele forajelor;</li>
  <li>caracteristicile fizice și mecanice ale straturilor, din analize de laborator;</li>
  <li>nivelul apei subterane la data investigării;</li>
  <li>adâncimea de îngheț și condițiile seismice ale amplasamentului;</li>
  <li>încadrarea în categoria geotehnică;</li>
  <li>recomandări privind adâncimea și sistemul de fundare, excavațiile și protecția vecinătăților.</li>
</ul>
<p>Pe larg: <a href="/ghid/ce-contine-un-studiu-geotehnic/">Ce conține un studiu geotehnic</a>.</p>

<h2>Categoria geotehnică și verificarea la cerința Af</h2>
<p>Conform normativului <strong>NP 074</strong> privind documentațiile geotehnice, fiecare lucrare se încadrează într-o categorie geotehnică (1, 2 sau 3), care corespunde unui risc geotehnic redus, moderat sau major. Încadrarea ține cont de natura terenului, de apa subterană, de importanța construcției, de vecinătăți și de zona seismică.</p>
<p>Pentru lucrările din categoriile geotehnice 2 și 3, studiul geotehnic se verifică de un verificator de proiecte atestat la cerința <strong>Af</strong> (rezistența și stabilitatea terenului de fundare). Vă spunem de la început în ce categorie se încadrează, probabil, lucrarea dumneavoastră.</p>

<h2>Cum lucrăm</h2>
<ol>
  <li><strong>Ne trimiteți datele construcției:</strong> adresa sau planul de situație, regimul de înălțime, dacă are subsol, suprafața construită aproximativă.</li>
  <li><strong>Stabilim programul de investigare</strong> (numărul și adâncimea forajelor, analizele de laborator) și vă trimitem oferta.</li>
  <li><strong>Executăm forajele</strong> pe amplasament și prelevăm probe.</li>
  <li><strong>Probele se analizează în laborator</strong>, iar rezultatele se interpretează.</li>
  <li><strong>Predăm studiul geotehnic</strong> semnat, gata de depus la dosarul de autorizare și de folosit de proiectant.</li>
</ol>
<p class="note">Programul de investigare (câte foraje și cât de adânci) depinde de construcție și de teren, nu de un tarif fix. De aceea oferta se face după ce aflăm ce construiți.</p>
`,
    faq: [
      { q: "Cât durează un studiu geotehnic?", a: "Depinde de numărul și adâncimea forajelor și de analizele de laborator necesare. Termenul exact vi-l comunicăm odată cu oferta, după ce aflăm datele construcției." },
      { q: "Pot folosi studiul geotehnic al vecinului?", a: "Nu. Studiul se întocmește pentru un amplasament și o construcție anume. Chiar pe terenuri alăturate stratificația și apa subterană pot fi diferite, iar încărcările construcției sunt altele." },
      { q: "Am nevoie de studiu geotehnic pentru o casă P sau P+1?", a: "Da. Studiul geotehnic face parte din documentația pentru autorizația de construire și pentru case. Pentru o casă obișnuită investigarea este, de regulă, mai simplă decât pentru o clădire înaltă sau cu subsol." },
      { q: "Ce trebuie să vă trimit pentru ofertă?", a: "Adresa sau planul de situație al terenului, ce construiți (regim de înălțime, subsol, suprafață aproximativă) și, dacă există, numele proiectantului. Cu aceste date stabilim programul de investigare." },
    ],
  },
  {
    slug: "foraje-geotehnice",
    nav: "Foraje geotehnice",
    title: "Foraje geotehnice București și Ilfov | FILIP GEOTEHNIC",
    description: "Foraje geotehnice în București și Ilfov, cu prelevare de probe pentru laborator și măsurarea nivelului apei subterane. Pentru studii geotehnice și proiectare.",
    h1: "Foraje geotehnice în București și Ilfov",
    lead: "Forajul geotehnic este singura metodă prin care vedem direct straturile de sub construcție, prelevăm probe pentru laborator și aflăm la ce adâncime este apa subterană.",
    card: "Foraje pe amplasament, cu prelevare de probe pentru laborator și măsurarea nivelului apei subterane.",
    body: `
<h2>Ce este un foraj geotehnic</h2>
<p>Forajul geotehnic este o gaură de diametru mic, executată cu o instalație de foraj până la adâncimea stabilită prin programul de investigare. Pe măsură ce se avansează, se descriu straturile traversate și se prelevează probe de pământ, care ajung apoi în laborator.</p>
<p>Rezultatul se trece în <strong>fișa forajului</strong>: grosimea și natura fiecărui strat, adâncimile de la care s-au luat probe și nivelul apei subterane. Fișele forajelor fac parte din studiul geotehnic.</p>

<h2>Ce aflăm dintr-un foraj</h2>
<ul>
  <li><strong>stratificația</strong>: umpluturi, argile, prafuri, nisipuri, pietrișuri și grosimea fiecăruia;</li>
  <li><strong>nivelul apei subterane</strong>: întâlnit și stabilizat, important pentru subsoluri și excavații;</li>
  <li><strong>probe pentru laborator</strong>: din ele se determină umiditatea, plasticitatea, granulometria, compresibilitatea și rezistența la forfecare;</li>
  <li>prezența <strong>terenurilor dificile</strong>: umpluturi groase, pământuri sensibile la umezire sau pământuri cu umflări și contracții mari.</li>
</ul>

<h2>Probe tulburate și netulburate</h2>
<p>Probele <strong>tulburate</strong> păstrează natura pământului, dar nu și structura lui; sunt suficiente pentru identificare și pentru încercări precum granulometria sau limitele de plasticitate. Probele <strong>netulburate</strong> se prelevează cu dispozitive speciale, ca să păstreze structura și umiditatea, și sunt necesare pentru încercările de compresibilitate și de rezistență.</p>

<h2>Penetrări dinamice</h2>
<p>Pe lângă foraje, se pot executa <strong>penetrări dinamice cu con</strong>: o tijă cu vârf conic este bătută în teren, iar numărul de lovituri pe fiecare interval arată cât de îndesat sau de consistent este terenul. Penetrările sunt rapide și completează forajele între punctele investigate.</p>

<h2>Câte foraje și cât de adânci</h2>
<p>Numărul, poziția și adâncimea forajelor se stabilesc în funcție de dimensiunile construcției, de încărcări, de existența subsolului și de categoria geotehnică, conform normativelor de investigare geotehnică (NP 074 și SR EN 1997). O casă fără subsol cere de regulă o investigare mai redusă decât un bloc cu subsol sau o hală cu deschideri mari.</p>

<h2>Ce trebuie pregătit pe amplasament</h2>
<ul>
  <li>acces pentru instalația de foraj până la punctele stabilite;</li>
  <li>informații despre rețelele îngropate (apă, canalizare, gaz, cabluri), ca forajele să le evite;</li>
  <li>acordul proprietarului terenului, dacă nu sunteți chiar dumneavoastră.</li>
</ul>
<p>După terminare, găurile de foraj se astupă.</p>
`,
    faq: [
      { q: "Cât de adânc se forează?", a: "Adâncimea se stabilește pentru fiecare lucrare, în funcție de construcție și de teren, astfel încât să cuprindă straturile influențate de fundații. Vă spunem adâncimea propusă odată cu oferta." },
      { q: "Strică forajul terenul sau curtea?", a: "Forajul are diametru mic, iar la final gaura se astupă. Instalația are nevoie de acces până la punctul de foraj; dacă accesul este dificil, discutăm dinainte soluția." },
      { q: "Puteți face foraje și fără studiu geotehnic complet?", a: "Da, de exemplu pentru un proiectant care are nevoie de date suplimentare sau pentru verificarea nivelului apei subterane. Spuneți-ne scopul și stabilim ce investigații sunt utile." },
    ],
  },
  {
    slug: "consultanta-geotehnica",
    nav: "Consultanță tehnică",
    title: "Consultanță geotehnică București și Ilfov | FILIP GEOTEHNIC",
    description: "Consultanță geotehnică pentru proiectanți, constructori și beneficiari: soluții de fundare, recepția terenului de fundare, excavații și sprijiniri.",
    h1: "Consultanță geotehnică pentru proiectanți și constructori",
    lead: "Sprijin tehnic pe tot parcursul lucrării: de la alegerea soluției de fundare până la verificarea terenului când excavația ajunge la cota de fundare.",
    card: "Alegerea soluției de fundare, verificarea terenului la cota de fundare, excavații și sprijiniri.",
    body: `
<h2>Ce înseamnă consultanța geotehnică</h2>
<p>Studiul geotehnic dă datele terenului. Consultanța geotehnică ajută la <strong>folosirea corectă a acestor date</strong>: în proiect, pe șantier și atunci când terenul găsit la excavație nu arată ca în foraje.</p>

<h2>Pentru cine</h2>
<ul>
  <li><strong>proiectanți de structură</strong>, care au nevoie de parametri geotehnici și de o discuție despre soluția de fundare;</li>
  <li><strong>constructori</strong>, pentru excavații, sprijiniri, epuismente și recepția terenului de fundare;</li>
  <li><strong>beneficiari</strong>, care vor să înțeleagă ce înseamnă rezultatele pentru construcția și costul fundației.</li>
</ul>

<h2>Situații în care vă putem ajuta</h2>
<h3>Alegerea soluției de fundare</h3>
<p>Fundații izolate sau continue, radier, îmbunătățirea terenului sau fundare indirectă: soluția potrivită depinde de teren, de încărcări și de vecinătăți. Analizăm variantele împreună cu proiectantul.</p>
<h3>Recepția terenului la cota de fundare</h3>
<p>Când excavația ajunge la cota de fundare, geotehnicianul verifică dacă terenul corespunde celui descris în studiu, înainte de turnarea betonului. Constatarea se consemnează într-un proces-verbal. Dacă terenul diferă, se stabilesc măsurile necesare.</p>
<h3>Excavații, sprijiniri și apa subterană</h3>
<p>Pentru subsoluri și excavații adânci analizăm stabilitatea taluzurilor, nevoia de sprijinire și măsurile pentru apa subterană, cu atenție la clădirile vecine.</p>
<h3>Terenuri dificile</h3>
<p>Umpluturile groase, pământurile sensibile la umezire și pământurile cu umflări și contracții mari cer măsuri speciale de fundare. Le identificăm din timp și propunem soluții.</p>
<h3>Fisuri la clădiri existente</h3>
<p>Când apar fisuri care pot avea legătură cu terenul, investigăm cauza înainte de orice consolidare.</p>
`,
    faq: [
      { q: "Este obligatorie recepția terenului de fundare?", a: "Verificarea naturii terenului la cota de fundare face parte din controlul calității lucrărilor și se consemnează într-un proces-verbal. Detaliile pentru lucrarea dumneavoastră le stabilește proiectul." },
      { q: "Lucrați și cu studiul geotehnic făcut de altă firmă?", a: "Da, putem oferi consultanță pe baza unui studiu existent. Dacă datele nu sunt suficiente pentru problema apărută, vă spunem ce investigații suplimentare sunt necesare." },
    ],
  },
  {
    slug: "monitorizare-geotehnica",
    nav: "Monitorizare",
    title: "Monitorizare geotehnică și tasări | FILIP GEOTEHNIC",
    description: "Monitorizare geotehnică în București și Ilfov: tasări ale construcțiilor, nivelul apei subterane și comportarea excavațiilor și sprijinirilor.",
    h1: "Monitorizare geotehnică: tasări, apă subterană, excavații",
    lead: "Urmărim în timp cum se comportă terenul și construcția, cu rapoarte periodice care arată din timp orice abatere de la valorile așteptate.",
    card: "Urmărirea tasărilor, a nivelului apei subterane și a comportării excavațiilor, cu rapoarte periodice.",
    body: `
<h2>De ce se monitorizează</h2>
<p>Calculele geotehnice estimează cum se va comporta terenul. Monitorizarea <strong>măsoară ce se întâmplă în realitate</strong>: dacă tasările rămân în limitele prevăzute, dacă nivelul apei subterane se schimbă și dacă excavațiile și clădirile vecine sunt stabile.</p>

<h2>Ce putem urmări</h2>
<h3>Tasările construcțiilor</h3>
<p>Pe construcție se montează repere de tasare, măsurate periodic. Comparând măsurătorile, se vede cât și cât de uniform s-a tasat clădirea.</p>
<h3>Nivelul apei subterane</h3>
<p>În foraje echipate ca piezometre se măsoară periodic nivelul apei. Datele sunt utile pentru subsoluri, epuismente și terenuri unde apa variază mult între anotimpuri.</p>
<h3>Excavații, sprijiniri și vecinătăți</h3>
<p>La excavațiile adânci se urmăresc deplasările sprijinirilor și ale clădirilor vecine, ca orice mișcare neprevăzută să fie observată la timp.</p>

<h2>Cum arată monitorizarea</h2>
<ol>
  <li>Stabilim, împreună cu proiectantul, ce se măsoară, unde și cât de des.</li>
  <li>Montăm reperele sau echipăm forajele și facem măsurătoarea inițială.</li>
  <li>Facem măsurătorile periodice și le comparăm cu valorile admise.</li>
  <li>Vă trimitem rapoarte periodice și vă anunțăm imediat dacă o valoare se apropie de prag.</li>
</ol>
`,
    faq: [
      { q: "Când este necesară monitorizarea?", a: "De obicei la construcții importante, pe terenuri dificile, la excavații adânci lângă alte clădiri sau când proiectul o cere prin programul de urmărire a comportării în timp. Proiectantul stabilește dacă și ce se urmărește." },
      { q: "Cât de des se fac măsurătorile?", a: "Frecvența se stabilește în funcție de etapa lucrării: mai des în timpul excavației și al execuției, mai rar după aceea. O stabilim împreună cu proiectantul." },
    ],
  },
];

/* ---------------- Zone ---------------- */
export const AREAS = [
  {
    slug: "studiu-geotehnic-bucuresti",
    name: "București",
    title: "Studiu geotehnic București, toate sectoarele | FILIP GEOTEHNIC",
    description: "Studii geotehnice și foraje în București, în toate cele 6 sectoare: pentru case, blocuri, extinderi și consolidări. Firmă cu sediul în Popești-Leordeni.",
    h1: "Studiu geotehnic în București",
    lead: "Executăm studii geotehnice și foraje în toate cele șase sectoare ale Capitalei, pentru construcții noi, extinderi, supraetajări și consolidări.",
    intro: `<p>În București, studiul geotehnic se depune la dosarul pentru autorizația de construire, emisă de primăria de sector sau de Primăria Municipiului București, după caz. Pe lângă datele obișnuite despre teren, la construcțiile din oraș contează mult <strong>vecinătățile</strong>: clădiri lipite, subsoluri alăturate, rețele îngropate și spațiu redus pentru utilaje.</p>`,
    specifics: `
<h2>Ce contează la terenurile din București</h2>
<ul>
  <li><strong>Zona seismică.</strong> București are, conform codului de proiectare seismică P100-1/2013, accelerația terenului pentru proiectare a<sub>g</sub> = 0,30 g și perioada de control T<sub>C</sub> = 1,6 s. Studiul geotehnic precizează aceste date pentru amplasament.</li>
  <li><strong>Adâncimea de îngheț</strong> este de aproximativ 0,80–0,90 m, conform STAS 6054. Fundațiile se așază sub această adâncime.</li>
  <li><strong>Umpluturi</strong> rămase de la construcții vechi, demolări sau nivelări apar des în zonele construite de mult timp și nu sunt teren bun de fundare.</li>
  <li><strong>Apa subterană</strong> poate fi aproape de suprafață în zonele joase, mai ales în apropierea râurilor, ceea ce contează la subsoluri.</li>
  <li><strong>Construcțiile alăturate</strong> cer atenție la excavații și la fundațiile noi, ca să nu fie afectate clădirile vecine.</li>
</ul>`,
    faq: [
      { q: "Lucrați în toate sectoarele?", a: "Da, executăm studii geotehnice și foraje în toate cele șase sectoare ale Bucureștiului." },
      { q: "Ce fac dacă terenul este într-o curte îngustă?", a: "Spuneți-ne de la început cum arată accesul. Alegem echipamentul și pozițiile forajelor în funcție de spațiul disponibil." },
    ],
  },
  {
    slug: "studiu-geotehnic-ilfov",
    name: "Ilfov",
    title: "Studiu geotehnic Ilfov, toate localitățile | FILIP GEOTEHNIC",
    description: "Studii geotehnice și foraje în județul Ilfov: Popești-Leordeni, Voluntari, Otopeni, Chiajna, Bragadiru, Pantelimon și celelalte localități.",
    h1: "Studiu geotehnic în județul Ilfov",
    lead: "Sediul nostru este în Ilfov, la Popești-Leordeni. Lucrăm în localitățile din jurul Capitalei, unde se construiește cel mai mult: case, ansambluri rezidențiale, hale și depozite.",
    intro: `<p>În Ilfov se construiește mult pe terenuri care până de curând au fost agricole. Acolo, primul strat este de obicei <strong>pământ vegetal</strong>, care nu este teren de fundare și trebuie depășit. În ansamblurile noi apar și <strong>umpluturi</strong> din nivelări sau din lucrările de infrastructură. Autorizația de construire se emite, după caz, de primăria localității sau de Consiliul Județean Ilfov, iar studiul geotehnic face parte din documentație.</p>`,
    specifics: `
<h2>Ce contează la terenurile din Ilfov</h2>
<ul>
  <li><strong>Pământul vegetal și umpluturile</strong> de la suprafață trebuie identificate și traversate de fundații.</li>
  <li><strong>Terenuri vecine diferite.</strong> În parcelările noi, loturile alăturate pot avea istorii diferite (umpluturi, gropi astupate), deci fiecare lot are nevoie de propriul studiu.</li>
  <li><strong>Apa subterană</strong> variază de la o zonă la alta; contează la subsoluri și la piscine.</li>
  <li><strong>Hale și depozite</strong> au încărcări mari pe pardoseală și deschideri mari, ceea ce cere o investigare adaptată.</li>
</ul>`,
    faq: [
      { q: "În ce localități din Ilfov lucrați?", a: "În localitățile din jurul Bucureștiului, printre care Popești-Leordeni, Voluntari, Otopeni, Chiajna, Bragadiru, Pantelimon, Berceni, Jilava și Măgurele. Pentru alte localități, întrebați-ne." },
      { q: "Am cumpărat un lot într-o parcelare. Pot folosi studiul dezvoltatorului?", a: "Un studiu făcut pentru altă construcție sau alt lot nu ține locul studiului pentru casa dumneavoastră. Poate fi însă util ca informație de pornire pentru programul de investigare." },
    ],
  },
  {
    slug: "studiu-geotehnic-popesti-leordeni",
    name: "Popești-Leordeni",
    title: "Studiu geotehnic Popești-Leordeni | FILIP GEOTEHNIC",
    description: "Studii geotehnice și foraje în Popești-Leordeni, unde ne este sediul: pentru case, blocuri și extinderi în oraș și în cartierele noi de lângă Berceni.",
    h1: "Studiu geotehnic în Popești-Leordeni",
    lead: "Popești-Leordeni este orașul în care avem sediul. Executăm studii geotehnice și foraje pentru case, blocuri și extinderi în tot orașul.",
    intro: `<p>Popești-Leordeni se învecinează cu Sectorul 4 al Capitalei și a crescut mult prin cartiere rezidențiale noi. Fiind aici, ajungem ușor pe amplasament, atât pentru foraje, cât și pentru verificarea terenului când excavația ajunge la cota de fundare.</p>`,
    specifics: `
<h2>Ce contează la construcțiile din Popești-Leordeni</h2>
<ul>
  <li><strong>Loturi noi pe foste terenuri agricole</strong>, cu pământ vegetal la suprafață și uneori umpluturi din nivelări.</li>
  <li><strong>Construcții apropiate</strong> în cartierele dense, unde contează excavațiile și efectul asupra caselor vecine.</li>
  <li><strong>Blocuri cu subsol</strong>, pentru care nivelul apei subterane și sprijinirea excavației sunt esențiale.</li>
</ul>`,
    faq: [
      { q: "Unde este sediul firmei?", a: "Sediul FILIP GEOTEHNIC S.R.L. este în orașul Popești-Leordeni, județul Ilfov." },
      { q: "Faceți și verificarea terenului la cota de fundare?", a: "Da. Când excavația ajunge la cota de fundare, verificăm dacă terenul corespunde studiului geotehnic, înainte de turnarea betonului." },
    ],
  },
  {
    slug: "studiu-geotehnic-voluntari",
    name: "Voluntari",
    title: "Studiu geotehnic Voluntari și Pipera | FILIP GEOTEHNIC",
    description: "Studii geotehnice și foraje în Voluntari și Pipera pentru case, ansambluri rezidențiale, clădiri de birouri și extinderi, adaptate fiecărei construcții.",
    h1: "Studiu geotehnic în Voluntari și Pipera",
    lead: "În Voluntari se construiesc deopotrivă case, ansambluri de locuințe și clădiri de birouri. Adaptăm investigarea geotehnică la fiecare tip de construcție.",
    intro: `<p>Orașul Voluntari, care include și o parte din zona Pipera, se învecinează cu Sectorul 2 al Capitalei. Aici construcțiile merg de la case individuale până la clădiri cu mai multe subsoluri, iar investigarea geotehnică diferă mult de la una la alta.</p>`,
    specifics: `
<h2>Ce contează la construcțiile din Voluntari</h2>
<ul>
  <li><strong>Clădiri cu subsoluri</strong>, pentru care contează nivelul apei subterane, stabilitatea excavației și sprijinirea ei.</li>
  <li><strong>Ansambluri rezidențiale</strong> construite în etape, unde investigarea trebuie să acopere întreaga suprafață, nu doar un punct.</li>
  <li><strong>Case pe loturi noi</strong>, cu pământ vegetal și umpluturi la suprafață.</li>
</ul>`,
    faq: [
      { q: "Lucrați și pentru clădiri de birouri?", a: "Da. Pentru clădirile mari, programul de investigare (numărul și adâncimea forajelor) se stabilește împreună cu proiectantul, în funcție de încărcări și de subsoluri." },
    ],
  },
  {
    slug: "studiu-geotehnic-otopeni",
    name: "Otopeni",
    title: "Studiu geotehnic Otopeni | FILIP GEOTEHNIC",
    description: "Studii geotehnice și foraje în Otopeni: case, blocuri, hale și depozite logistice. Investigare adaptată încărcărilor mari pe pardoseală.",
    h1: "Studiu geotehnic în Otopeni",
    lead: "În Otopeni se construiesc case și blocuri, dar și hale și depozite. Pentru fiecare stabilim un program de investigare potrivit încărcărilor.",
    intro: `<p>Orașul Otopeni, aflat la nord de București, combină zone rezidențiale cu zone de hale, depozite și clădiri de servicii. La hale contează nu doar fundațiile stâlpilor, ci și <strong>pardoseala</strong>, care preia încărcări mari pe suprafețe întinse.</p>`,
    specifics: `
<h2>Ce contează la construcțiile din Otopeni</h2>
<ul>
  <li><strong>Hale și depozite:</strong> încărcări mari pe pardoseală, deschideri mari și platforme pentru trafic greu.</li>
  <li><strong>Platforme și drumuri interioare</strong>, pentru care contează capacitatea portantă a terenului de sub ele.</li>
  <li><strong>Case și blocuri</strong> în zonele rezidențiale, cu investigarea obișnuită pentru autorizare.</li>
</ul>`,
    faq: [
      { q: "Faceți investigații pentru platforme și drumuri?", a: "Da. Pentru platforme, parcări și drumuri interioare investigăm terenul de sub sistemul rutier, ca proiectantul să poată dimensiona straturile." },
    ],
  },
  {
    slug: "studiu-geotehnic-chiajna",
    name: "Chiajna",
    title: "Studiu geotehnic Chiajna, Roșu și Dudu | FILIP GEOTEHNIC",
    description: "Studii geotehnice și foraje în comuna Chiajna (Chiajna, Roșu, Dudu), lângă Militari: case, blocuri și ansambluri rezidențiale.",
    h1: "Studiu geotehnic în Chiajna, Roșu și Dudu",
    lead: "Comuna Chiajna, cu satele Chiajna, Roșu și Dudu, este una dintre zonele din Ilfov unde se construiește cel mai mult. Executăm aici studii geotehnice și foraje.",
    intro: `<p>Chiajna se învecinează cu Sectorul 6 al Capitalei, în zona Militari. Ansamblurile de blocuri și cartierele de case au crescut repede, pe terenuri care înainte erau agricole sau neconstruite.</p>`,
    specifics: `
<h2>Ce contează la construcțiile din Chiajna</h2>
<ul>
  <li><strong>Blocuri în ansambluri dense</strong>, unde excavațiile și fundațiile noi sunt aproape de clădiri deja locuite.</li>
  <li><strong>Case pe loturi din parcelări</strong>, cu pământ vegetal și posibile umpluturi din nivelări.</li>
  <li><strong>Apa subterană</strong>, care se verifică pentru fiecare amplasament, mai ales unde se proiectează subsol.</li>
</ul>`,
    faq: [
      { q: "Lucrați și în satele Roșu și Dudu?", a: "Da, în toată comuna Chiajna: în Chiajna, Roșu și Dudu." },
    ],
  },
];

/* ---------------- Ghiduri ---------------- */
export const GUIDES = [
  {
    slug: "cand-este-necesar-un-studiu-geotehnic",
    nav: "Când este necesar un studiu geotehnic",
    title: "Când este necesar un studiu geotehnic? | Ghid",
    description: "Când este obligatoriu studiul geotehnic: autorizația de construire, extinderi, supraetajări, consolidări, drumuri și când merită făcut oricum.",
    h1: "Când este necesar un studiu geotehnic?",
    lead: "Pe scurt: pentru aproape orice construcție nouă care se autorizează, pentru extinderi și supraetajări și ori de câte ori terenul poate pune probleme.",
    body: `
<h2>Pentru autorizația de construire</h2>
<p>Documentația pentru autorizația de construire cuprinde studiile de specialitate cerute prin certificatul de urbanism, iar <strong>studiul geotehnic</strong> se numără printre ele pentru construcțiile noi. Este valabil pentru case, blocuri, hale, clădiri de birouri și anexe care au fundații.</p>
<p>Verificați în certificatul de urbanism lista studiilor cerute pentru lucrarea dumneavoastră.</p>

<h2>Pentru extinderi, supraetajări și mansardări</h2>
<p>Când o clădire existentă primește încărcări noi, trebuie verificat dacă terenul și fundațiile le pot prelua. Studiul geotehnic dă datele necesare proiectantului pentru această verificare.</p>

<h2>Pentru consolidări și fisuri</h2>
<p>Fisurile din pereți pot avea multe cauze. Când există bănuiala că vin din teren (tasări inegale, umezirea terenului, pământuri care se umflă și se contractă), studiul geotehnic arată cauza înainte de a alege soluția de consolidare.</p>

<h2>Pentru drumuri, platforme și rețele</h2>
<p>Drumurile, parcările, platformele industriale și rețelele îngropate se proiectează tot pe baza datelor despre teren: capacitatea portantă, sensibilitatea la îngheț și nivelul apei.</p>

<h2>Înainte de a cumpăra un teren</h2>
<p>Nu este obligatoriu, dar poate economisi bani: un teren cu umpluturi groase sau cu apă aproape de suprafață poate face fundația mult mai scumpă. Investigarea făcută înainte de cumpărare vă spune la ce să vă așteptați.</p>

<h2>Pe scurt</h2>
<div class="table-wrap"><table>
  <thead><tr><th>Situație</th><th>Studiu geotehnic</th></tr></thead>
  <tbody>
    <tr><td>Casă, bloc, hală nouă</td><td>Necesar pentru autorizare</td></tr>
    <tr><td>Extindere, supraetajare, mansardare</td><td>Necesar pentru verificarea fundațiilor</td></tr>
    <tr><td>Consolidare, fisuri legate de teren</td><td>Recomandat, ca să se afle cauza</td></tr>
    <tr><td>Drum, parcare, platformă</td><td>Necesar pentru proiectare</td></tr>
    <tr><td>Cumpărarea unui teren</td><td>Opțional, dar util</td></tr>
  </tbody>
</table></div>
`,
    faq: [
      { q: "Este obligatoriu studiul geotehnic pentru o anexă sau un garaj?", a: "Depinde de lucrare și de ce cere certificatul de urbanism. Pentru construcțiile cu fundații care se autorizează, de regulă este cerut. Verificați lista studiilor din certificatul de urbanism." },
    ],
  },
  {
    slug: "ce-contine-un-studiu-geotehnic",
    nav: "Ce conține un studiu geotehnic",
    title: "Ce conține un studiu geotehnic? Ghid pe înțelesul tuturor",
    description: "Ce găsiți într-un studiu geotehnic: fișe de foraj, stratificație, analize de laborator, apa subterană, categoria geotehnică și recomandări de fundare.",
    h1: "Ce conține un studiu geotehnic?",
    lead: "Un studiu geotehnic are o parte de date (ce s-a găsit în teren și în laborator) și o parte de concluzii (cum se recomandă fundarea). Iată ce înseamnă fiecare.",
    body: `
<h2>1. Datele despre amplasament și construcție</h2>
<p>Unde este terenul, cum arată (plan, în pantă, cu construcții vecine) și ce se va construi: regim de înălțime, subsol, încărcări aproximative.</p>

<h2>2. Lucrările de investigare</h2>
<p>Câte foraje și penetrări s-au executat, unde și până la ce adâncime, cu planul de amplasare al acestora.</p>

<h2>3. Stratificația și fișele de foraj</h2>
<p>Pentru fiecare foraj, fișa arată straturile întâlnite (de exemplu umplutură, argilă prăfoasă, nisip, pietriș), grosimea lor și adâncimile de la care s-au prelevat probe.</p>

<h2>4. Rezultatele de laborator</h2>
<p>Caracteristicile straturilor: umiditate, plasticitate, granulometrie, greutate volumică, compresibilitate și rezistență la forfecare. Din ele rezultă parametrii folosiți de proiectant în calcul.</p>

<h2>5. Apa subterană</h2>
<p>Adâncimea la care a fost întâlnită apa și nivelul la care s-a stabilizat, cu observații despre variația ei posibilă.</p>

<h2>6. Condițiile de amplasament</h2>
<p>Adâncimea de îngheț, datele seismice ale zonei și, unde este cazul, prezența terenurilor dificile.</p>

<h2>7. Categoria geotehnică</h2>
<p>Încadrarea lucrării în categoria geotehnică 1, 2 sau 3, conform NP 074, de care depinde și verificarea studiului la cerința Af.</p>

<h2>8. Recomandările de fundare</h2>
<p>Partea cea mai importantă pentru proiectant și pentru buget: <strong>adâncimea minimă de fundare</strong>, stratul pe care se recomandă fundarea, valorile de calcul pentru teren și recomandări pentru excavații, sprijiniri, epuismente și protecția vecinătăților.</p>

<p class="note">Dacă aveți deja un studiu geotehnic și nu sunteți sigur ce înseamnă concluziile pentru construcția dumneavoastră, vi le putem explica. Vedeți <a href="/consultanta-geotehnica/">consultanța geotehnică</a>.</p>
`,
    faq: [],
  },
  {
    slug: "cat-costa-un-studiu-geotehnic",
    nav: "Cât costă un studiu geotehnic",
    title: "Cât costă un studiu geotehnic? De ce depinde prețul",
    description: "De ce depinde prețul unui studiu geotehnic: numărul și adâncimea forajelor, analizele de laborator, accesul pe amplasament și tipul construcției.",
    h1: "Cât costă un studiu geotehnic?",
    lead: "Prețul unui studiu geotehnic nu este fix, pentru că depinde de cât de mult trebuie investigat terenul. Iată ce îl influențează și cum obțineți o ofertă corectă.",
    body: `
<h2>De ce nu există un preț unic</h2>
<p>Un studiu pentru o casă fără subsol și unul pentru un bloc cu două subsoluri au același nume, dar cer o investigare foarte diferită. Prețul urmează volumul de lucru real, nu titlul documentației.</p>

<h2>Ce influențează prețul</h2>
<ul>
  <li><strong>Numărul de foraje și penetrări</strong>, care depinde de suprafața și de forma construcției.</li>
  <li><strong>Adâncimea forajelor</strong>: o construcție cu subsol sau cu încărcări mari cere foraje mai adânci.</li>
  <li><strong>Analizele de laborator</strong>: câte probe și ce încercări sunt necesare.</li>
  <li><strong>Categoria geotehnică</strong> și, implicit, nevoia de verificare la cerința Af.</li>
  <li><strong>Accesul pe amplasament</strong>: curte îngustă, teren în pantă, lipsa accesului pentru utilaj.</li>
  <li><strong>Distanța</strong> până la amplasament.</li>
</ul>

<h2>Cum obțineți o ofertă corectă</h2>
<ol>
  <li>Trimiteți adresa sau planul de situație al terenului.</li>
  <li>Spuneți ce construiți: regim de înălțime, subsol, suprafață construită aproximativă, destinație.</li>
  <li>Menționați orice știți despre teren: umpluturi, apă în fântânile din zonă, construcții vechi demolate.</li>
</ol>
<p>Cu aceste informații stabilim programul de investigare și vă trimitem oferta, cu ce include.</p>

<h2>De ce nu merită să economisiți la studiu</h2>
<p>Studiul geotehnic costă puțin față de fundație. O investigare prea sumară poate duce fie la o fundație supradimensionată (plătiți beton și oțel în plus), fie la una nepotrivită terenului, cu reparații mult mai scumpe mai târziu.</p>
`,
    faq: [
      { q: "Puteți să-mi spuneți un preț la telefon?", a: "Vă putem da o ofertă după ce aflăm unde este terenul și ce construiți. Fără aceste date, orice preț ar fi o ghicire." },
    ],
  },
  {
    slug: "studiu-geotehnic-pentru-casa",
    nav: "Studiu geotehnic pentru casă",
    title: "Studiu geotehnic pentru casă: ce trebuie să știți",
    description: "Ghid pentru cei care își construiesc o casă: de ce aveți nevoie de studiu geotehnic, când îl comandați, ce date ne trimiteți și ce urmează după.",
    h1: "Studiu geotehnic pentru casă: ghid pentru proprietari",
    lead: "Vă construiți o casă în București sau Ilfov? Iată unde se încadrează studiul geotehnic în pașii spre autorizație și ce trebuie să pregătiți.",
    body: `
<h2>De ce are nevoie o casă de studiu geotehnic</h2>
<p>Chiar și o casă parter se sprijină pe teren prin fundații. Studiul geotehnic arată la ce adâncime este un strat bun de fundare și dacă există probleme (umpluturi, apă, pământuri care se umflă la umezire). Pe baza lui, proiectantul alege fundația potrivită, nici prea scumpă, nici prea slabă.</p>

<h2>Când îl comandați</h2>
<p>După ce aveți <strong>certificatul de urbanism</strong> și, ideal, după ce arhitectul a stabilit amplasarea casei pe teren și dacă are subsol. Studiul trebuie să fie gata înainte ca inginerul de structură să proiecteze fundațiile.</p>

<h2>Ce ne trimiteți</h2>
<ul>
  <li>adresa terenului sau planul de situație;</li>
  <li>regimul de înălțime (P, P+1, P+1+M) și dacă are subsol;</li>
  <li>suprafața construită aproximativă;</li>
  <li>datele de contact ale arhitectului sau ale inginerului, dacă le aveți.</li>
</ul>

<h2>Ce urmează după studiu</h2>
<ol>
  <li>Proiectantul de structură dimensionează fundațiile pe baza recomandărilor din studiu.</li>
  <li>Studiul intră în documentația pentru autorizația de construire.</li>
  <li>Pe șantier, când săpătura ajunge la cota de fundare, se verifică terenul înainte de turnarea betonului.</li>
</ol>

<h2>Greșeli de evitat</h2>
<ul>
  <li><strong>Folosirea studiului altcuiva</strong> (al vecinului sau al dezvoltatorului): nu este valabil pentru casa dumneavoastră.</li>
  <li><strong>Mutarea casei pe teren după studiu</strong> fără să anunțați geotehnicianul: forajele trebuie să fie în zona construcției.</li>
  <li><strong>Adăugarea unui subsol după studiu</strong>: schimbă adâncimea necesară a investigării.</li>
</ul>
`,
    faq: [
      { q: "Ce fac dacă am adăugat un subsol după ce s-a făcut studiul?", a: "Spuneți-ne. Subsolul schimbă adâncimea de fundare și uneori necesită foraje suplimentare sau o reevaluare a recomandărilor." },
    ],
  },
];

/* ---------------- Întrebări frecvente (pagina dedicată) ---------------- */
export const FAQ = [
  { q: "Ce este un studiu geotehnic?", a: "Documentația care descrie terenul de pe amplasament (straturi, caracteristici, apă subterană) și stabilește condițiile de fundare pentru construcția proiectată." },
  { q: "Când este obligatoriu studiul geotehnic?", a: "Pentru construcțiile noi care se autorizează, pentru extinderi și supraetajări și pentru alte lucrări cerute prin certificatul de urbanism. Detalii în ghidul <a href=\"/ghid/cand-este-necesar-un-studiu-geotehnic/\">Când este necesar un studiu geotehnic</a>." },
  { q: "Cât costă un studiu geotehnic?", a: "Depinde de numărul și adâncimea forajelor, de analizele de laborator și de accesul pe amplasament. Oferta o facem după ce aflăm ce construiți. Vedeți <a href=\"/ghid/cat-costa-un-studiu-geotehnic/\">de ce depinde prețul</a>." },
  { q: "Cât durează?", a: "Depinde de volumul investigațiilor și al analizelor. Termenul vi-l comunicăm odată cu oferta." },
  { q: "În ce zone lucrați?", a: "În București, în toate sectoarele, și în județul Ilfov: Popești-Leordeni, Voluntari, Otopeni, Chiajna și celelalte localități din jurul Capitalei." },
  { q: "Ce date trebuie să vă trimit?", a: "Adresa sau planul de situație, ce construiți (regim de înălțime, subsol, suprafață) și, dacă există, datele proiectantului." },
  { q: "Pot folosi studiul geotehnic al altui teren?", a: "Nu. Studiul se face pentru amplasamentul și construcția dumneavoastră." },
  { q: "Ce este categoria geotehnică?", a: "Încadrarea lucrării, conform NP 074, în categoria 1, 2 sau 3 (risc geotehnic redus, moderat sau major). Pentru categoriile 2 și 3, studiul se verifică la cerința Af." },
  { q: "Faceți și verificarea terenului la cota de fundare?", a: "Da. Verificăm dacă terenul din excavație corespunde studiului, înainte de turnarea fundațiilor, și consemnăm constatarea într-un proces-verbal." },
  { q: "Lucrați și pentru firme și proiectanți?", a: "Da, lucrăm pentru persoane fizice, dezvoltatori, constructori și birouri de proiectare." },
];

import Link from "next/link";
import type { ReactNode } from "react";
import type { VehicleId } from "@/config/pricing";

/**
 * Landing pages, one per search-intent cluster (see docs/keyword-map.md). Each page has its own
 * useful content — no city-name-swapped templates (Google treats those as doorway pages).
 * Facts here are general and verifiable (geography, road names, safety basics); business claims
 * (fleet, arrival times, non-stop) come only from src/config/site.ts.
 */
export type Landing = {
  slug: string;
  group: "zona" | "serviciu" | "ghid";
  nav: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  vehicle?: VehicleId;
  /** Example distances for the computed price table (hypothetical routes, labelled as such). */
  examples?: number[];
  sections: { h2: string; body: ReactNode }[];
  faq: { q: string; a: ReactNode }[];
  related: string[];
  serviceType?: string;
  areaServed?: string[];
};

const L = ({ href, children }: { href: string; children: ReactNode }) => <Link className="link" href={href}>{children}</Link>;

export const LANDINGS: Landing[] = [
  {
    slug: "tractari-centura-bucuresti",
    group: "zona",
    nav: "Centura București",
    title: "Tractări pe Centura București — preț online",
    description: "Tractare auto pe Centura București: Chitila, Otopeni, Voluntari, Pantelimon, Jilava, Bragadiru, Chiajna. Prețul pe km îl afli online.",
    h1: "Tractări pe Centura București",
    lead: "Ai rămas cu mașina pe Centură? Calculezi prețul tractării în câteva secunde, apoi suni sau scrii pe WhatsApp cu totul deja completat.",
    examples: [10, 25, 40],
    areaServed: ["Centura București", "Ilfov", "București"],
    serviceType: "Tractări auto",
    sections: [
      {
        h2: "Pe ce porțiuni ale Centurii venim",
        body: (
          <>
            <p>Centura București (DNCB) înconjoară orașul prin Ilfov și face legătura între ieșirile spre autostrăzile A1, A2, A3 și drumurile naționale. Tractăm de pe orice tronson, inclusiv din zonele cu trafic greu de la intersecțiile cu ieșirile din oraș:</p>
            <ul>
              <li>nord: Chitila, Mogoșoaia, Otopeni, Tunari, Voluntari;</li>
              <li>est: Pantelimon, Cernica, Glina;</li>
              <li>sud: Popești-Leordeni, Berceni, Jilava, Măgurele;</li>
              <li>vest: Bragadiru, Domnești, Chiajna, zona de legătură cu A1.</li>
            </ul>
          </>
        ),
      },
      {
        h2: "Ce faci până ajunge platforma",
        body: (
          <ol>
            <li>Oprește cât mai în dreapta, pe acostament, și pune avariile.</li>
            <li>Îmbracă vesta reflectorizantă și așază triunghiul la o distanță la care cei care vin din spate îl văd din timp.</li>
            <li>Ieșiți din mașină pe partea dinspre acostament și așteptați în afara carosabilului, nu între mașină și trafic.</li>
            <li>Dacă mașina blochează o bandă sau e un pericol, sună la 112.</li>
            <li>Notează unde ești: kilometrul, o intersecție sau o benzinărie din apropiere — ne ajută să te găsim repede.</li>
          </ol>
        ),
      },
      {
        h2: "Cât costă o tractare pe Centură",
        body: (
          <p>
            Prețul depinde de tipul vehiculului și de kilometri: de unde te luăm de pe Centură până unde duci mașina (acasă, la service, la dealer). Tabelul de mai jos arată câteva exemple calculate cu aceleași tarife ca <L href="/calculator/">calculatorul</L>; pentru traseul tău exact, completează calculatorul de pe această pagină.
          </p>
        ),
      },
    ],
    faq: [
      { q: "Tractați și noaptea de pe Centură?", a: "Programul de lucru este afișat sus pe pagină. Dacă ai nevoie de tractare în afara lui, sună și îți spunem pe loc dacă putem veni." },
      { q: "Pot duce mașina direct la un service din București?", a: "Da. Introdu în calculator distanța până la service; prețul se calculează pe kilometrii reali ai traseului." },
      { q: "Ce se întâmplă dacă trebuie să așteptați la încărcare?", a: "Primele 30 de minute de staționare sunt gratuite, apoi tariful este de 100 lei pe oră." },
    ],
    related: ["tractari-ilfov", "tractari-autostrada-bucuresti-pitesti", "tractari-sectoare-bucuresti", "tractari-masini-avariate"],
  },
  {
    slug: "tractari-autostrada-bucuresti-pitesti",
    group: "zona",
    nav: "A1 București–Pitești",
    title: "Tractări A1 București–Pitești — preț pe km",
    description: "Tractare auto pe A1 București–Pitești, pe ambele sensuri. Ce faci pe banda de urgență și cât costă transportul pe platformă, calculat pe km.",
    h1: "Tractări pe Autostrada A1 București–Pitești",
    lead: "Pană sau accident pe A1? Află prețul transportului pe platformă până în București, Pitești sau oriunde altundeva, înainte să suni.",
    examples: [30, 60, 120],
    areaServed: ["Autostrada A1 București–Pitești", "București", "Pitești"],
    serviceType: "Tractări auto pe autostradă",
    sections: [
      {
        h2: "Pe ambele sensuri, de la ieșirea din București până la Pitești",
        body: (
          <p>
            A1 București–Pitești este prima autostradă din România și una dintre cele mai circulate. Venim pe ambele sensuri, de la capătul dinspre București (zona Chiajna și legătura cu Centura) prin zona Bolintin și Găești până la Pitești, și ducem mașina unde ai nevoie: acasă, la un service din București sau din Pitești, ori mai departe.
          </p>
        ),
      },
      {
        h2: "Ce faci dacă rămâi cu mașina pe autostradă",
        body: (
          <>
            <ol>
              <li>Trage pe banda de urgență, cât mai la dreapta, și pune avariile.</li>
              <li>Îmbracă vesta reflectorizantă înainte să cobori.</li>
              <li>Așază triunghiul în spatele mașinii, la o distanță la care cei care vin cu viteză mare îl văd din timp.</li>
              <li>Ieșiți toți din mașină pe partea dreaptă și așteptați în spatele parapetului, nu în mașină și nu pe carosabil.</li>
              <li>Sună la 112 dacă mașina e pe banda de circulație sau dacă e cineva rănit; apoi sună-ne pentru tractare.</li>
              <li>Spune-ne sensul de mers și kilometrul de pe borna cea mai apropiată.</li>
            </ol>
            <p>Mai multe detalii în <L href="/ghid/masina-defecta-pe-autostrada/">ghidul pentru mașina defectă pe autostradă</L>.</p>
          </>
        ),
      },
      {
        h2: "Prețul tractării pe A1",
        body: <p>Se calculează pe kilometrii traseului, de la locul unde e mașina până la destinație, și pe tipul vehiculului. Exemplele de mai jos folosesc tarifele din <L href="/tarife-tractari/">pagina de tarife</L>.</p>,
      },
    ],
    faq: [
      { q: "Mă puteți duce cu mașina până la un service din Pitești?", a: "Da, destinația o alegi tu. Prețul se calculează pe kilometrii reali până acolo." },
      { q: "Pasagerii pot merge cu platforma?", a: "Spune-ne la telefon câte persoane sunt, ca să ne organizăm; numărul de locuri din cabină diferă de la o platformă la alta." },
      { q: "Ce documente trebuie să am?", a: "Talonul mașinii și actul de identitate; dacă mașina a fost cumpărată de la un dealer sau parc auto, și factura de achiziție." },
    ],
    related: ["tractari-centura-bucuresti", "transport-auto-pe-platforma", "tractari-masini-avariate", "ghid/masina-defecta-pe-autostrada"],
  },
  {
    slug: "tractari-ilfov",
    group: "zona",
    nav: "Ilfov",
    title: "Tractări auto Ilfov: Otopeni, Voluntari, Chiajna",
    description: "Tractare auto în Ilfov: Otopeni, Voluntari, Pantelimon, Popești-Leordeni, Bragadiru, Chiajna, Chitila, Buftea, Măgurele. Preț calculat online.",
    h1: "Tractări auto în Ilfov",
    lead: "Din orice localitate din jurul Bucureștiului, cu prețul calculat pe kilometri înainte să suni.",
    examples: [15, 30, 50],
    areaServed: ["Ilfov"],
    serviceType: "Tractări auto",
    sections: [
      {
        h2: "Localități din Ilfov unde venim",
        body: (
          <>
            <p>Lucrăm în tot județul Ilfov, în special în localitățile lipite de București și de Centură:</p>
            <ul className="columns-2 sm:columns-3">
              {["Otopeni", "Voluntari", "Pantelimon", "Popești-Leordeni", "Bragadiru", "Chiajna", "Chitila", "Buftea", "Măgurele", "Jilava", "Mogoșoaia", "Domnești", "Ciorogârla", "Cernica", "Glina", "Berceni", "Afumați", "Ștefăneștii de Jos", "Dobroești", "Tunari", "Corbeanca", "Snagov"].map((x) => <li key={x}>{x}</li>)}
            </ul>
          </>
        ),
      },
      {
        h2: "De la tine din curte sau de pe drum",
        body: <p>Mașina nu mai pornește în parcare, are o roată blocată sau ai avut un accident pe un drum județean: o încărcăm pe platformă și o ducem unde vrei — la service, acasă sau la un dealer din București. Dacă mașina are roțile blocate, bifează opțiunea în calculator; vezi și <L href="/tractari-masini-avariate/">tractări mașini avariate</L>.</p>,
      },
      {
        h2: "Cât costă o tractare în Ilfov",
        body: <p>Prețul e același oriunde: kilometri × tariful vehiculului, apoi coeficientul tarifar. Exemplele de mai jos sunt pentru distanțe tipice din Ilfov până în București.</p>,
      },
    ],
    faq: [
      { q: "Este mai scump în Ilfov decât în București?", a: "Nu există o taxă separată pentru Ilfov; plătești kilometrii traseului, calculați la fel ca în București." },
      { q: "Mă puteți lua de la mine din curte?", a: "Da, dacă platforma are acces până la mașină. Spune-ne la telefon dacă accesul e îngust sau pe un drum nepietruit." },
    ],
    related: ["tractari-centura-bucuresti", "tractari-sectoare-bucuresti", "tractari-autostrada-bucuresti-pitesti", "tarife-tractari"],
  },
  {
    slug: "tractari-sectoare-bucuresti",
    group: "zona",
    nav: "Sectoarele 1–6",
    title: "Tractări auto pe sectoare, București 1–6",
    description: "Tractare auto în Sectorul 1, 2, 3, 4, 5 și 6: Băneasa, Colentina, Titan, Berceni, Rahova, Drumul Taberei, Militari. Preț pe km calculat online.",
    h1: "Tractări auto în toate sectoarele Bucureștiului",
    lead: "În oraș, distanțele sunt scurte, dar traficul nu. Afli prețul înainte și știi exact ce plătești.",
    examples: [5, 10, 20],
    areaServed: ["București", "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6"],
    serviceType: "Tractări auto",
    sections: [
      {
        h2: "Cartiere din fiecare sector",
        body: (
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Sectorul 1", "Băneasa, Aviației, Pipera, Dorobanți, Floreasca, Victoriei, Domenii, Bucureștii Noi"],
              ["Sectorul 2", "Colentina, Tei, Obor, Pantelimon, Iancului, Ștefan cel Mare"],
              ["Sectorul 3", "Titan, Dristor, Vitan, Balta Albă, Centrul Civic, Unirii"],
              ["Sectorul 4", "Berceni, Tineretului, Văcărești, Olteniței, Giurgiului"],
              ["Sectorul 5", "Rahova, Ferentari, Cotroceni, 13 Septembrie, Panduri"],
              ["Sectorul 6", "Drumul Taberei, Militari, Crângași, Giulești, Grozăvești"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[var(--radius-m)] bg-concrete-2 p-4">
                <dt className="font-[800] text-ink">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ),
      },
      {
        h2: "Tractare în oraș: la service, acasă sau la parcare",
        body: <p>Cele mai multe tractări din oraș sunt scurte: de la locul unde a rămas mașina până la un service sau acasă. Pentru trasee sub 30 km se aplică tariful din coloana Extra-City; vezi <L href="/tarife-tractari/">toate tarifele</L>.</p>,
      },
      {
        h2: "Exemple de preț pentru distanțe din oraș",
        body: <p>Distanțele de mai jos sunt orientative pentru trasee în București; pentru traseul tău, introdu kilometrii în calculator.</p>,
      },
    ],
    faq: [
      { q: "Tractați din parcări subterane?", a: "Depinde de înălțimea de acces a parcării. Spune-ne la telefon înălțimea și nivelul, ca să verificăm dacă platforma poate intra." },
      { q: "Pot plăti după ce ajunge mașina la destinație?", a: "Modalitatea de plată se stabilește la telefon, înainte de plecare." },
    ],
    related: ["tractari-ilfov", "tractari-centura-bucuresti", "tractari-moto-bucuresti", "tarife-tractari"],
  },
  {
    slug: "transport-auto-pe-platforma",
    group: "serviciu",
    nav: "Transport pe platformă",
    title: "Transport auto pe platformă din București",
    description: "Transport auto pe platformă din București în toată țara: mașini cumpărate, mutări, drumuri la dealer sau ITP. Preț pe km calculat online.",
    h1: "Transport auto pe platformă, din București în toată țara",
    lead: "Ai cumpărat o mașină din alt oraș sau o muți? O transportăm pe platformă, fără kilometri în plus la bord.",
    vehicle: "sedan",
    examples: [100, 250, 457],
    areaServed: ["România"],
    serviceType: "Transport auto pe platformă",
    sections: [
      {
        h2: "Când ai nevoie de transport pe platformă",
        body: (
          <ul>
            <li>ai cumpărat o mașină din alt oraș și nu vrei s-o conduci (sau nu are încă numere);</li>
            <li>muți mașina într-un alt oraș;</li>
            <li>o duci la un service sau la un dealer departe de casă;</li>
            <li>mașina nu e în stare să circule până la ITP.</li>
          </ul>
        ),
      },
      {
        h2: "Exemplu real: București → Cluj-Napoca",
        body: <p>Pentru un traseu de 457 km, un sedan costă cu tarifele noastre cât arată ultima coloană din tabelul de mai jos. Calculul complet — kilometri, tarif, coeficient — îl vezi în <L href="/calculator/?vehicul=sedan&km=457">calculator</L>.</p>,
      },
      {
        h2: "Documentele pentru transport",
        body: <p>Talonul mașinii, actul tău de identitate și nota de comandă; pentru mașinile cumpărate de la dealeri sau parcuri auto, și factura de achiziție.</p>,
      },
    ],
    faq: [
      { q: "Pot transporta o mașină fără numere?", a: "Pe platformă, mașina nu circulă pe drum. Ia cu tine documentele de proprietate (factura sau contractul) și talonul, dacă există." },
      { q: "Cât durează transportul?", a: "Calculatorul arată o durată aproximativă a drumului; ora de ridicare se stabilește la telefon." },
    ],
    related: ["tractari-autostrada-bucuresti-pitesti", "tractari-microbuze-autoutilitare", "tarife-tractari", "tractari-masini-avariate"],
  },
  {
    slug: "tractari-moto-bucuresti",
    group: "serviciu",
    nav: "Tractări moto",
    title: "Tractări moto București — transport pe platformă",
    description: "Tractare și transport motociclete în București și Ilfov, pe platformă. Cel mai mic tarif pe km din grilă. Calculează prețul online.",
    h1: "Tractări moto în București",
    lead: "Motocicleta nu mai pornește sau ai căzut? O transportăm pe platformă, la cel mai mic tarif pe kilometru din grilă.",
    vehicle: "moto",
    examples: [10, 30, 100],
    areaServed: ["București", "Ilfov"],
    serviceType: "Transport motociclete",
    sections: [
      {
        h2: "Motociclete de 100–300 kg",
        body: <p>Categoria moto din calculator acoperă motocicletele și scuterele între 100 și 300 kg. Pentru motociclete mai grele sau ATV-uri, sună și spune-ne modelul.</p>,
      },
      {
        h2: "Pregătește motocicleta",
        body: (
          <ul>
            <li>scoate din genți și din topcase obiectele de valoare;</li>
            <li>spune-ne dacă motocicleta are roata blocată sau furca strâmbă după o cădere — se încarcă altfel;</li>
            <li>ai la tine talonul și actul de identitate.</li>
          </ul>
        ),
      },
      { h2: "Exemple de preț pentru motociclete", body: <p>Calculate cu tariful moto: 3,3 lei/km Intra-City și 2,3 lei/km Extra-City, apoi coeficientul tarifar.</p> },
    ],
    faq: [
      { q: "Transportați și scutere?", a: "Da, intră în categoria moto din calculator." },
      { q: "Pot transporta două motociclete odată?", a: "Spune-ne la telefon; depinde de platforma disponibilă." },
    ],
    related: ["tractari-sectoare-bucuresti", "tractari-ilfov", "tarife-tractari", "transport-auto-pe-platforma"],
  },
  {
    slug: "tractari-masini-avariate",
    group: "serviciu",
    nav: "Mașini avariate",
    title: "Tractări mașini avariate și cu roți blocate",
    description: "Tractare pentru mașini avariate sau cu roți blocate în București, Ilfov, pe Centură și pe A1. Ce documente îți trebuie și cum se calculează prețul.",
    h1: "Tractări pentru mașini avariate și cu roți blocate",
    lead: "După un accident sau cu o roată blocată, mașina nu se mai poate rula pe platformă. O încărcăm altfel — și îți spunem prețul înainte.",
    vehicle: "hatchback",
    examples: [10, 30, 60],
    areaServed: ["București", "Ilfov", "Centura București", "Autostrada A1"],
    serviceType: "Tractări mașini avariate",
    sections: [
      {
        h2: "De ce costă diferit o mașină cu roți blocate",
        body: <p>O mașină care se rulează urcă pe platformă trasă de troliu. Una cu roți blocate, direcția ruptă sau fără roți cere timp și echipament în plus la încărcare. De aceea, în calculator bifezi „Mașină avariată (roți blocate)”, iar suplimentul îl confirmăm la telefon, după ce ne spui ce s-a întâmplat.</p>,
      },
      {
        h2: "După un accident",
        body: (
          <ol>
            <li>Asigură locul (avarii, vestă, triunghi) și sună la 112 dacă e cineva rănit sau dacă mașinile blochează drumul.</li>
            <li>Fă poze mașinilor și locului înainte să fie mutate, dacă se poate în siguranță.</li>
            <li>Completați constatarea amiabilă dacă e cazul, sau așteptați poliția.</li>
            <li>Sună-ne cu locul exact și destinația: service, parcare sau acasă.</li>
          </ol>
        ),
      },
      { h2: "Exemple de preț (fără supliment)", body: <p>Tabelul arată prețul de bază pentru un hatchback; suplimentul pentru roți blocate se adaugă după confirmare.</p> },
    ],
    faq: [
      { q: "Duceți mașina direct la service-ul asigurătorului?", a: "Da, destinația o alegi tu. Spune-ne adresa service-ului și calculăm traseul." },
      { q: "Pot primi factură pentru asigurare?", a: "Documentele de plată se stabilesc la telefon; spune-ne de la început dacă ai nevoie de factură." },
    ],
    related: ["tractari-centura-bucuresti", "tractari-autostrada-bucuresti-pitesti", "tractari-ilfov", "ghid/masina-defecta-pe-autostrada"],
  },
  {
    slug: "tractari-microbuze-autoutilitare",
    group: "serviciu",
    nav: "Microbuze și autoutilitare",
    title: "Tractări microbuze și autoutilitare (7,5 t)",
    description: "Tractare pe platformă pentru microbuze de 16–24 locuri și autoutilitare de 3–7,5 tone, în București, Ilfov și pe A1. Preț pe km calculat online.",
    h1: "Tractări microbuze și autoutilitare",
    lead: "Vehicule mari, aceeași regulă: afli prețul înainte. Microbuze de 2–3,5 tone și autoutilitare de 3–7,5 tone.",
    vehicle: "duba",
    examples: [20, 60, 150],
    areaServed: ["București", "Ilfov", "România"],
    serviceType: "Tractări vehicule utilitare",
    sections: [
      {
        h2: "Ce categorii transportăm",
        body: (
          <ul>
            <li><strong>Microbuz</strong> — între 2.000 și 3.500 kg, 16–24 locuri: 10,3 lei/km Intra-City, 7,5 lei/km Extra-City.</li>
            <li><strong>Autoutilitară</strong> — între 3.000 și 7.500 kg: 10,5 lei/km Intra-City, 12,0 lei/km Extra-City.</li>
          </ul>
        ),
      },
      { h2: "Spune-ne masa reală", body: <p>Pentru vehiculele încărcate contează masa totală, nu doar modelul. Dacă duba e încărcată cu marfă, spune-ne la telefon, ca să trimitem platforma potrivită.</p> },
      { h2: "Exemple de preț pentru o autoutilitară", body: <p>Pentru microbuz, schimbă vehiculul în calculator.</p> },
    ],
    faq: [
      { q: "Transportați camioane peste 7,5 tone?", a: "Grila de prețuri acoperă vehicule până la 7,5 tone. Pentru altceva, sună și spune-ne masa și dimensiunile." },
      { q: "Trebuie descărcată marfa înainte?", a: "Depinde de masa totală. Spune-ne cât e încărcătura și decidem împreună." },
    ],
    related: ["transport-auto-pe-platforma", "tractari-autostrada-bucuresti-pitesti", "tarife-tractari", "tractari-centura-bucuresti"],
  },
  {
    slug: "ghid/masina-defecta-pe-autostrada",
    group: "ghid",
    nav: "Ghid: mașină defectă pe autostradă",
    title: "Mașină defectă pe autostradă: ce faci, pas cu pas",
    description: "Pașii de siguranță când rămâi cu mașina pe autostradă sau pe Centură: banda de urgență, vesta, triunghiul, când suni la 112 și cum chemi tractarea.",
    h1: "Ce faci când rămâi cu mașina defectă pe autostradă",
    lead: "Cele mai periculoase minute sunt cele de după oprire. Iată ordinea în care merită să faci lucrurile.",
    examples: [],
    sections: [
      {
        h2: "1. Ieși din trafic",
        body: <p>La primul semn (bord aprins, zgomot, fum, pierdere de putere) semnalizează și trage pe banda de urgență sau într-o parcare. Oprește cât mai la dreapta și pune avariile. Dacă mașina se oprește pe banda de circulație și nu o poți muta, rămâi cu centura pusă doar cât suni la 112, apoi ieși pe partea dinspre parapet când e sigur.</p>,
      },
      {
        h2: "2. Fă-te vizibil",
        body: <p>Îmbracă vesta reflectorizantă înainte să cobori. Așază triunghiul în spatele mașinii, la o distanță la care șoferii care vin cu viteză îl văd din timp; mergi spre el pe lângă parapet, cu fața spre trafic.</p>,
      },
      {
        h2: "3. Așteaptă în siguranță",
        body: <p>Toată lumea iese pe partea dreaptă și așteaptă în spatele parapetului, nu în mașină și nu pe carosabil. Copiii și animalele se țin aproape.</p>,
      },
      {
        h2: "4. Spune exact unde ești",
        body: <p>Autostrada și sensul de mers, plus kilometrul de pe cea mai apropiată bornă sau panou. Pe Centură, cea mai apropiată intersecție sau localitate. Dacă ai Google Maps, trimite-ne locația pe WhatsApp.</p>,
      },
      {
        h2: "5. Cheamă tractarea, cu prețul știut",
        body: <p>Calculează prețul în <L href="/calculator/">calculator</L> — alegi vehiculul, scrii kilometrii până la destinație — și trimite-ne totul pe WhatsApp dintr-un singur buton.</p>,
      },
    ],
    faq: [
      { q: "Când sun la 112 și când la tractare?", a: "La 112 când există un pericol: mașina e pe banda de circulație, sunt răniți, fum sau foc. Pentru o pană simplă, pe banda de urgență, chemi direct tractarea." },
      { q: "Pot repara singur pe banda de urgență?", a: "Nu e recomandat pe autostradă: banda de urgență e îngustă și traficul e rapid. Așteaptă în spatele parapetului." },
    ],
    related: ["tractari-autostrada-bucuresti-pitesti", "tractari-centura-bucuresti", "tractari-masini-avariate"],
  },
];

export const landingBySlug = (slug: string) => LANDINGS.find((l) => l.slug === slug);

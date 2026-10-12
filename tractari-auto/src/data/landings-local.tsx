import Link from "next/link";
import type { ReactNode } from "react";
import type { Landing } from "@/data/landings";

/**
 * Locality, sector, non-stop and guide pages. Each one is built around facts specific to the
 * place (its main roads, exits, landmarks) or to the problem — not a template with the name swapped.
 */
const L = ({ href, children }: { href: string; children: ReactNode }) => <Link className="link" href={href}>{children}</Link>;

type Place = {
  slug: string;
  name: string;
  where: string;
  roads: string[];
  context: ReactNode;
  tips: string[];
  examples: number[];
  related: string[];
};

const PLACES: Place[] = [
  {
    slug: "tractari-otopeni",
    name: "Otopeni",
    where: "la nord de București, pe DN1, lângă Aeroportul Internațional Henri Coandă",
    roads: ["DN1 (București–Ploiești)", "Centura București, tronsonul de nord", "drumurile spre Tunari și Corbeanca"],
    context: <p>În Otopeni, cele mai multe tractări pornesc de pe DN1 — unul dintre cele mai aglomerate drumuri de ieșire din București — și din zona aeroportului, unde mașinile rămân uneori fără baterie după zile întregi în parcare.</p>,
    tips: ["Dacă mașina e într-o parcare a aeroportului, spune-ne parcarea și nivelul — unele au acces limitat în înălțime.", "Pe DN1, oprește în afara benzii, în dreapta, și pune triunghiul vizibil din timp."],
    examples: [10, 20, 40],
    related: ["tractari-voluntari", "tractari-buftea", "tractari-centura-bucuresti", "tractari-sector-1"],
  },
  {
    slug: "tractari-voluntari",
    name: "Voluntari și Pipera",
    where: "la nord-est de București, cu zona de birouri Pipera și ieșirea spre A3",
    roads: ["Bulevardul Pipera", "Centura București, tronsonul de nord-est", "legătura cu A3 București–Ploiești", "DN2 spre Afumați"],
    context: <p>Voluntari și Pipera au trafic intens la orele de vârf, cu multe ansambluri rezidențiale și parcări subterane de birouri. De aici, mașinile ajung de obicei la service-uri din nordul Bucureștiului sau la dealeri de pe Centură.</p>,
    tips: ["Pentru parcări subterane, spune-ne înălțimea maximă de acces.", "În ansamblurile rezidențiale cu barieră, anunță paza că vine platforma."],
    examples: [8, 15, 30],
    related: ["tractari-otopeni", "tractari-pantelimon", "tractari-sector-2", "tractari-centura-bucuresti"],
  },
  {
    slug: "tractari-dragomiresti-vale",
    name: "Dragomirești-Vale",
    where: "la vest de București, la nord de Chiajna",
    roads: ["drumurile spre Chiajna și Militari", "legătura cu Centura București, tronsonul de vest", "drumurile spre Chitila"],
    context: <p>Dragomirești-Vale e vecină cu Chiajna, cu multe cartiere noi de case. Mașinile de aici ajung de obicei la service-uri din Militari sau din Chiajna, la câțiva kilometri distanță.</p>,
    tips: ["Pe străzile noi fără nume oficial, trimite-ne locația pe WhatsApp.", "Spune-ne dacă accesul e pe drum nepietruit."],
    examples: [8, 15, 30],
    related: ["tractari-chiajna", "tractari-militari", "tractari-ciorogarla", "tractari-centura-bucuresti"],
  },
  {
    slug: "tractari-ciorogarla",
    name: "Ciorogârla",
    where: "la vest de București, lângă A1 București–Pitești",
    roads: ["Autostrada A1 București–Pitești, primii kilometri", "drumurile spre Chiajna și Domnești", "drumurile spre Dragomirești-Vale"],
    context: <p>Ciorogârla e aproape de primii kilometri ai A1, așa că aici ajung des mașini rămase pe autostradă la ieșirea din București. Din Ciorogârla, Militari și Chiajna sunt aproape.</p>,
    tips: ["Dacă ai rămas pe A1 lângă Ciorogârla, spune-ne sensul și kilometrul.", "Pentru curți private, spune-ne dacă poarta e îngustă."],
    examples: [10, 20, 35],
    related: ["tractari-autostrada-bucuresti-pitesti", "tractari-chiajna", "tractari-domnesti", "tractari-militari"],
  },
  {
    slug: "tractari-domnesti",
    name: "Domnești",
    where: "la sud-vest de București, între A1 și Centura București",
    roads: ["Centura București, tronsonul de sud-vest", "drumurile spre Chiajna și Ciorogârla", "drumurile spre Bragadiru"],
    context: <p>Domnești e la câțiva kilometri de Chiajna și de Centură, între A1 și Șoseaua Alexandriei. Tractările de aici merg de obicei spre Militari, Chiajna sau spre service-uri din vestul Bucureștiului.</p>,
    tips: ["Spune-ne cea mai apropiată intersecție sau un reper (benzinărie, magazin).", "Pe Centură, oprește în afara benzii și pune triunghiul."],
    examples: [10, 20, 35],
    related: ["tractari-chiajna", "tractari-bragadiru", "tractari-ciorogarla", "tractari-centura-bucuresti"],
  },
  {
    slug: "tractari-bragadiru",
    name: "Bragadiru",
    where: "la sud-vest de București, pe Șoseaua Alexandriei (DN6)",
    roads: ["DN6 / Șoseaua Alexandriei", "Centura București, tronsonul de sud-vest", "drumurile spre Măgurele și Domnești"],
    context: <p>Bragadiru a crescut repede, cu străzi noi și uneori fără asfalt. Spune-ne dacă accesul până la mașină e pe drum de pământ, ca să venim cu platforma potrivită.</p>,
    tips: ["Pe străzile nemarcate, trimite-ne locația exactă pe WhatsApp.", "Pe DN6, trafic intens dimineața spre București — ține avariile pornite."],
    examples: [10, 20, 35],
    related: ["tractari-chiajna", "tractari-jilava", "tractari-sector-5", "tractari-ilfov"],
  },
  {
    slug: "tractari-popesti-leordeni",
    name: "Popești-Leordeni",
    where: "la sud-est de București, pe Calea Olteniței (DN4)",
    roads: ["DN4 / Calea Olteniței", "Centura București, tronsonul de sud-est", "legătura spre Berceni (Sectorul 4)"],
    context: <p>Calea Olteniței leagă Popești-Leordeni de Sectorul 4 și e aglomerată aproape toată ziua. Tractările de aici merg de obicei spre service-uri din sudul Bucureștiului sau spre Centură.</p>,
    tips: ["Pe Calea Olteniței, oprește pe o stradă laterală dacă mașina încă se mișcă.", "Spune-ne cea mai apropiată intersecție — ne ajută mai mult decât numărul de stradă."],
    examples: [8, 15, 30],
    related: ["tractari-sector-4", "tractari-jilava", "tractari-pantelimon", "tractari-centura-bucuresti"],
  },
  {
    slug: "tractari-pantelimon",
    name: "Pantelimon",
    where: "la est de București, pe DN3, aproape de începutul A2",
    roads: ["DN3 / Șoseaua Pantelimon", "Centura București, tronsonul de est", "legătura cu A2 București–Constanța"],
    context: <p>Din Pantelimon pleacă drumul spre A2, așa că aici ajung și mașinile rămase pe autostrada spre mare. Ducem mașina în București, acasă sau la un service ales de tine.</p>,
    tips: ["Dacă ai rămas pe A2, spune-ne kilometrul și sensul.", "Pe DN3, la ieșirea din oraș, oprește cât mai în dreapta."],
    examples: [10, 25, 50],
    related: ["tractari-sector-2", "tractari-sector-3", "tractari-voluntari", "tractari-centura-bucuresti"],
  },
  {
    slug: "tractari-jilava",
    name: "Jilava",
    where: "la sud de București, pe DN5 spre Giurgiu",
    roads: ["DN5 / Șoseaua Giurgiului", "Centura București, tronsonul de sud", "legătura spre Berceni și Sectorul 4"],
    context: <p>Jilava e pe DN5, drumul spre Giurgiu, cu mult trafic greu și camioane. Pe acest drum e important să ieși complet de pe carosabil înainte să cobori din mașină.</p>,
    tips: ["Pe DN5 circulă multe camioane: așteaptă în afara drumului.", "Spune-ne dacă ești înainte sau după intersecția cu Centura."],
    examples: [8, 20, 40],
    related: ["tractari-popesti-leordeni", "tractari-bragadiru", "tractari-sector-4", "tractari-centura-bucuresti"],
  },
  {
    slug: "tractari-buftea",
    name: "Buftea",
    where: "la nord-vest de București, lângă lacul Buftea, pe DN1A",
    roads: ["DN1A (București–Buftea)", "drumurile spre Mogoșoaia și Chitila", "Centura București, tronsonul de nord-vest"],
    context: <p>Buftea e ceva mai departe de București decât localitățile lipite de Centură, așa că distanța contează în preț. Calculatorul îți arată exact cât costă până la destinația ta.</p>,
    tips: ["Pe DN1A, oprește pe acostament sau într-o benzinărie.", "Pentru mașini lăsate la case de vacanță lângă lac, spune-ne dacă accesul e pe drum îngust."],
    examples: [20, 30, 50],
    related: ["tractari-otopeni", "tractari-chiajna", "tractari-ilfov", "tractari-centura-bucuresti"],
  },
];

type Sector = { n: number; areas: string; roads: string[]; context: string; related: string[] };
const SECTORS: Sector[] = [
  { n: 1, areas: "Băneasa, Aviației, Pipera, Dorobanți, Floreasca, Primăverii, Domenii, Bucureștii Noi", roads: ["Calea Victoriei", "Șoseaua Kiseleff", "Bulevardul Aerogării", "ieșirea spre DN1 și Otopeni"], context: "Sectorul 1 are multe clădiri de birouri și parcări subterane, plus ieșirea spre DN1 și aeroport.", related: ["tractari-otopeni", "tractari-voluntari", "tractari-sector-2", "tractari-sector-6"] },
  { n: 2, areas: "Colentina, Tei, Obor, Pantelimon, Iancului, Ștefan cel Mare, Floreasca-Est", roads: ["Șoseaua Colentina", "Șoseaua Pantelimon", "Bulevardul Ștefan cel Mare", "ieșirea spre DN2 și DN3"], context: "Sectorul 2 are artere lungi spre ieșirile de est și nord-est, cu mult trafic spre Pantelimon și Voluntari.", related: ["tractari-pantelimon", "tractari-voluntari", "tractari-sector-1", "tractari-sector-3"] },
  { n: 3, areas: "Titan, Dristor, Vitan, Balta Albă, Centrul Civic, Unirii, Văcărești", roads: ["Bulevardul Unirii", "Bulevardul Basarabia", "Calea Vitan", "drumul spre A2"], context: "Sectorul 3 e cel mai populat, cu blocuri dese și parcări pline — spune-ne cum se ajunge la mașină.", related: ["tractari-pantelimon", "tractari-sector-2", "tractari-sector-4", "tractari-popesti-leordeni"] },
  { n: 4, areas: "Berceni, Tineretului, Văcărești, Olteniței, Giurgiului", roads: ["Calea Văcărești", "Șoseaua Giurgiului", "Bulevardul Constantin Brâncoveanu", "ieșirile spre DN4 și DN5"], context: "Sectorul 4 iese spre sud, pe Calea Olteniței și Șoseaua Giurgiului, adică spre Popești-Leordeni și Jilava.", related: ["tractari-popesti-leordeni", "tractari-jilava", "tractari-sector-3", "tractari-sector-5"] },
  { n: 5, areas: "Rahova, Ferentari, Cotroceni, 13 Septembrie, Panduri, Berceni-Vest", roads: ["Calea Rahovei", "Șoseaua Alexandriei", "Calea 13 Septembrie", "ieșirea spre DN6 și Bragadiru"], context: "Sectorul 5 face legătura cu Bragadiru și DN6; în zonele vechi străzile sunt înguste și parcările aglomerate.", related: ["tractari-bragadiru", "tractari-sector-4", "tractari-sector-6", "tractari-jilava"] },
  { n: 6, areas: "Drumul Taberei, Militari, Crângași, Giulești, Grozăvești, Ghencea", roads: ["Bulevardul Iuliu Maniu", "Drumul Taberei", "Calea Giulești", "ieșirea spre A1 și Chiajna"], context: "Din Sectorul 6 pleacă A1 spre Pitești, prin Bulevardul Iuliu Maniu și Chiajna — multe tractări de pe autostradă ajung aici.", related: ["tractari-militari", "tractari-chiajna", "tractari-autostrada-bucuresti-pitesti", "tractari-sector-5"] },
];

const primaryPages: Landing[] = [
  {
    slug: "tractari-chiajna",
    group: "zona",
    nav: "Chiajna",
    title: "Tractări auto Chiajna non-stop — preț pe km",
    description: "Tractare auto non-stop în Chiajna, Roșu, Dudu și Militari Residence, la intrarea pe A1 și pe Centura de vest. Prețul pe km îl afli online.",
    h1: "Tractări auto în Chiajna, non-stop",
    lead: "Chiajna e zona noastră de bază: Roșu, Dudu, Militari Residence, intrarea pe A1 și Centura de vest. Prețul îl afli înainte să suni.",
    examples: [5, 10, 25],
    areaServed: ["Chiajna", "Roșu", "Dudu", "Militari Residence", "Ilfov"],
    serviceType: "Tractări auto",
    sections: [
      {
        h2: "Unde venim în Chiajna",
        body: (
          <>
            <p>Comuna Chiajna, la vest de București, cuprinde satele Chiajna, Roșu și Dudu, plus ansamblul Militari Residence. Venim oriunde în comună, la orice oră:</p>
            <ul>
              <li><strong>Militari Residence</strong> și zona străzii Rezervelor — blocuri dese, parcări subterane și supraterane;</li>
              <li><strong>Roșu</strong> și <strong>Dudu</strong> — cartiere de case, străzi noi, uneori fără asfalt;</li>
              <li><strong>Bulevardul Iuliu Maniu</strong> spre ieșirea din oraș și zona comercială de la intrarea în Chiajna;</li>
              <li><strong>intrarea pe A1</strong> și <strong>Centura de vest</strong>, unde se strică cele mai multe mașini în trafic.</li>
            </ul>
          </>
        ),
      },
      {
        h2: "Situațiile pe care le întâlnim cel mai des",
        body: (
          <ul>
            <li>mașina nu pornește dimineața în parcarea blocului — vezi <L href="/ghid/masina-nu-porneste/">ce poți verifica singur</L>;</li>
            <li>pană sau accident la intrarea pe A1 ori pe Centură — <L href="/ghid/masina-defecta-pe-autostrada/">ce faci până ajungem</L>;</li>
            <li>mașină cumpărată de la un dealer și dusă acasă pe platformă;</li>
            <li>transport la un service din Militari, Chiajna sau oriunde în București.</li>
          </ul>
        ),
      },
      {
        h2: "Ce ne ajută să ajungem repede",
        body: (
          <ul>
            <li>locația trimisă pe WhatsApp — în Militari Residence și în Roșu numerele de stradă sunt greu de găsit noaptea;</li>
            <li>numărul blocului, scara și nivelul parcării, dacă mașina e într-o parcare subterană;</li>
            <li>pe A1 sau pe Centură: sensul de mers și cel mai apropiat reper.</li>
          </ul>
        ),
      },
      { h2: "Cât costă o tractare în Chiajna", body: <p>Distanțele sunt mici: până în Militari sunt câțiva kilometri. Prețul se calculează pe kilometrii reali, cu tarifele din <L href="/tarife-tractari/">grila noastră</L>.</p> },
    ],
    faq: [
      { q: "Veniți noaptea în Militari Residence?", a: "Da, lucrăm non-stop, inclusiv în weekend și de sărbători." },
      { q: "Puteți scoate mașina din parcarea subterană?", a: "Depinde de înălțimea de acces. Spune-ne înălțimea și nivelul; dacă platforma nu intră, găsim împreună o soluție." },
      { q: "Ce costă cel mai puțin: service în Chiajna sau în Militari?", a: "Plătești doar kilometrii traseului. Pune ambele variante în calculator și compară." },
    ],
    related: ["tractari-militari", "tractari-autostrada-bucuresti-pitesti", "tractari-centura-bucuresti", "tractari-dragomiresti-vale"],
  },
  {
    slug: "tractari-militari",
    group: "zona",
    nav: "Militari",
    title: "Tractări auto Militari non-stop — Sector 6",
    description: "Tractare auto non-stop în Militari: Iuliu Maniu, Preciziei, Pacii, Gorjului, Lujerului, Apusului, Uverturii. Preț pe km calculat online, înainte să suni.",
    h1: "Tractări auto în Militari, non-stop",
    lead: "De la Lujerului până la Preciziei și ieșirea spre A1: venim oricând și îți spunem prețul dinainte.",
    examples: [3, 8, 20],
    areaServed: ["Militari", "Sector 6", "București"],
    serviceType: "Tractări auto",
    sections: [
      {
        h2: "Zonele din Militari unde venim",
        body: (
          <ul>
            <li>de-a lungul <strong>Bulevardului Iuliu Maniu</strong>, de la Lujerului la Preciziei;</li>
            <li>cartierele din jurul stațiilor de metrou <strong>Lujerului, Gorjului, Pacii și Preciziei</strong>;</li>
            <li><strong>Apusului, Uverturii, Valea Cascadelor, Rezervelor</strong> spre Chiajna;</li>
            <li>zona industrială <strong>Preciziei</strong>, cu service-uri și depozite.</li>
          </ul>
        ),
      },
      {
        h2: "Militari, A1 și Centura",
        body: <p>Militari e poarta de vest a Bucureștiului: Bulevardul Iuliu Maniu continuă spre Chiajna, intrarea pe A1 București–Pitești și Centura de vest. Multe mașini rămase pe <L href="/tractari-autostrada-bucuresti-pitesti/">A1</L> sau pe <L href="/tractari-centura-bucuresti/">Centură</L> ajung la un service din Militari.</p>,
      },
      {
        h2: "Ce ne ajută să ajungem repede",
        body: (
          <ul>
            <li>pe Iuliu Maniu: sensul de mers și cea mai apropiată stație de metrou;</li>
            <li>în parcările dintre blocuri: scara și cum se intră cu o mașină mare;</li>
            <li>dacă mașina are roțile blocate, bifează opțiunea în calculator.</li>
          </ul>
        ),
      },
      { h2: "Cât costă o tractare în Militari", body: <p>În cartier, distanțele sunt de câțiva kilometri, deci se aplică tariful pentru primii 30 km din <L href="/tarife-tractari/">grilă</L>. Vezi exemplele de mai jos sau calculează exact.</p> },
    ],
    faq: [
      { q: "Veniți și noaptea în Militari?", a: "Da, lucrăm non-stop, 24 de ore din 24." },
      { q: "Puteți duce mașina la un service din Preciziei?", a: "Da, destinația o alegi tu; prețul se calculează pe kilometrii reali." },
    ],
    related: ["tractari-chiajna", "tractari-sector-6", "tractari-autostrada-bucuresti-pitesti", "tractari-centura-bucuresti"],
  },
];

const placePages: Landing[] = PLACES.map((p) => ({
  slug: p.slug,
  group: "localitate",
  nav: p.name,
  title: `Tractări ${p.name.split(" și ")[0]} non-stop, preț pe km`,
  description: `Tractare auto non-stop în ${p.name}, ${p.where.split(",")[0]}. ${p.roads[0]}. Calculezi prețul online înainte să suni.`.slice(0, 158),
  h1: `Tractări auto în ${p.name}`,
  lead: `Non-stop, ${p.where}. Prețul îl afli pe loc, din calculator.`,
  examples: p.examples,
  areaServed: [p.name.split(" și ")[0], "Ilfov"],
  serviceType: "Tractări auto",
  sections: [
    { h2: `Tractări în ${p.name}: ce trebuie să știi`, body: p.context },
    { h2: "Drumurile pe care venim cel mai des", body: <ul>{p.roads.map((r) => <li key={r}>{r}</li>)}</ul> },
    { h2: "Sfaturi pentru zona asta", body: <ul>{p.tips.map((t) => <li key={t}>{t}</li>)}</ul> },
    { h2: `Cât costă o tractare din ${p.name}`, body: <p>Prețul se calculează pe kilometrii reali până la destinație, cu aceleași tarife ca peste tot — vezi <L href="/tarife-tractari/">tarifele</L>. Mai jos, câteva distanțe tipice din zonă.</p> },
  ],
  faq: [
    { q: `Veniți și noaptea în ${p.name}?`, a: "Da, lucrăm non-stop, 24 de ore din 24, inclusiv în weekend și de sărbători." },
    { q: "Pot duce mașina la un service din București?", a: "Da. Introdu în calculator distanța până la service; plătești kilometrii reali ai traseului." },
  ],
  related: p.related,
}));

const sectorPages: Landing[] = SECTORS.map((s) => ({
  slug: `tractari-sector-${s.n}`,
  group: "sector",
  nav: `Sectorul ${s.n}`,
  title: `Tractări auto Sector ${s.n} București non-stop`,
  description: `Tractare auto non-stop în Sectorul ${s.n}: ${s.areas.split(", ").slice(0, 4).join(", ")}. Preț pe km calculat online, înainte să suni.`,
  h1: `Tractări auto în Sectorul ${s.n}`,
  lead: `Non-stop, în ${s.areas.split(", ").slice(0, 3).join(", ")} și tot sectorul. Afli prețul înainte să suni.`,
  examples: [3, 8, 15],
  areaServed: [`Sector ${s.n}`, "București"],
  serviceType: "Tractări auto",
  sections: [
    { h2: `Cartiere din Sectorul ${s.n}`, body: <p>{s.areas}.</p> },
    { h2: "Artere și ieșiri din sector", body: <><p>{s.context}</p><ul>{s.roads.map((r) => <li key={r}>{r}</li>)}</ul></> },
    { h2: "Tractare în oraș, distanțe scurte", body: <p>Majoritatea tractărilor din sector sunt de câțiva kilometri, până la un service sau acasă. Pentru trasee scurte se aplică tariful Extra-City din <L href="/tarife-tractari/">grila de tarife</L>.</p> },
  ],
  faq: [
    { q: "Veniți și noaptea?", a: "Da, lucrăm non-stop, inclusiv în weekend și de sărbători." },
    { q: "Tractați din parcări subterane?", a: "Depinde de înălțimea de acces. Spune-ne înălțimea și nivelul parcării." },
  ],
  related: s.related,
}));

const extraPages: Landing[] = [
  {
    slug: "tractari-non-stop-bucuresti",
    group: "serviciu",
    nav: "Tractări non-stop",
    title: "Tractări auto non-stop București, 24/7",
    description: "Tractări auto non-stop în București și Ilfov, 24 de ore din 24, inclusiv noaptea, în weekend și de sărbători. Calculezi prețul pe km înainte să suni.",
    h1: "Tractări auto non-stop în București",
    lead: "Zi sau noapte, în weekend sau de sărbători: calculezi prețul în câteva secunde și suni.",
    examples: [10, 30, 60],
    areaServed: ["București", "Ilfov", "Centura București", "Autostrada A1"],
    serviceType: "Tractări auto non-stop",
    sections: [
      { h2: "Același preț și noaptea", body: <p>Calculatorul folosește aceeași grilă de tarife oricând suni — prețul pe kilometru nu se schimbă noaptea, în weekend sau de sărbători.</p> },
      {
        h2: "Ce să ai pregătit când suni noaptea",
        body: (
          <ul>
            <li>locația exactă — cel mai simplu, trimisă pe WhatsApp;</li>
            <li>tipul mașinii și dacă are roțile blocate;</li>
            <li>destinația: acasă, la service sau într-o parcare;</li>
            <li>talonul și actul de identitate.</li>
          </ul>
        ),
      },
      { h2: "Unde venim", body: <p>În toate <L href="/tractari-sectoare-bucuresti/">sectoarele Bucureștiului</L>, în <L href="/tractari-ilfov/">Ilfov</L>, pe <L href="/tractari-centura-bucuresti/">Centură</L> și pe <L href="/tractari-autostrada-bucuresti-pitesti/">A1 București–Pitești</L>.</p> },
    ],
    faq: [
      { q: "Costă mai mult noaptea?", a: "Nu: calculatorul aplică aceleași tarife pe km oricând. Singurele adaosuri posibile sunt staționarea peste 30 de minute și suplimentul pentru roți blocate." },
      { q: "Lucrați și de Crăciun sau de Paște?", a: "Da, lucrăm non-stop, inclusiv de sărbători." },
    ],
    related: ["tractari-centura-bucuresti", "tractari-autostrada-bucuresti-pitesti", "tractari-sectoare-bucuresti", "tarife-tractari"],
  },
  {
    slug: "ghid/accident-ce-faci",
    group: "ghid",
    nav: "Ghid: după un accident",
    title: "Ai avut un accident? Pașii până la tractare",
    description: "Ce faci după un accident rutier: siguranța locului, 112, poze, constatarea amiabilă când e posibilă și cum chemi tractarea cu prețul știut dinainte.",
    h1: "Ai avut un accident: ce faci, pas cu pas",
    lead: "Primele minute contează pentru siguranță și pentru dosarul de asigurare. Iată ordinea firească.",
    examples: [],
    sections: [
      { h2: "1. Siguranța înainte de orice", body: <p>Pune avariile, îmbracă vesta reflectorizantă și așază triunghiul. Dacă sunt răniți, dacă mașinile blochează drumul sau dacă celălalt șofer nu colaborează, sună la 112.</p> },
      { h2: "2. Fotografii", body: <p>Înainte ca mașinile să fie mutate — dacă se poate în siguranță — fă poze de ansamblu, la avarii, la numerele de înmatriculare și la marcajele de pe drum.</p> },
      { h2: "3. Constatare amiabilă sau poliție", body: <p>Constatarea amiabilă se poate completa când nu sunt victime, sunt implicate cel mult două vehicule, ambele au RCA valabil și șoferii sunt de acord asupra vinovăției. Altfel, așteptați poliția. Detaliile exacte le confirmi cu asigurătorul tău.</p> },
      { h2: "4. Tractarea", body: <p>Dacă mașina nu mai poate circula, calculează prețul în <L href="/calculator/">calculator</L> (bifează „roți blocate” dacă e cazul) și sună-ne. Vezi și <L href="/tractari-masini-avariate/">tractări mașini avariate</L>.</p> },
    ],
    faq: [{ q: "Pot muta mașina înainte să vină poliția?", a: "Doar dacă blochează traficul și după ce ai făcut poze clare; în rest, așteaptă indicațiile poliției." }],
    related: ["tractari-masini-avariate", "ghid/masina-defecta-pe-autostrada", "tractari-non-stop-bucuresti"],
  },
  {
    slug: "ghid/masina-nu-porneste",
    group: "ghid",
    nav: "Ghid: mașina nu pornește",
    title: "Mașina nu pornește: cauze și când chemi tractarea",
    description: "Mașina nu pornește? Cele mai comune cauze — baterie, demaror, combustibil, imobilizator — ce poți verifica singur și când e mai sigur să chemi tractarea.",
    h1: "Mașina nu pornește: ce verifici și când chemi tractarea",
    lead: "Uneori e doar bateria. Alteori, încercările repetate fac mai mult rău. Câteva verificări simple te ajută să decizi.",
    examples: [],
    sections: [
      { h2: "Ce auzi când răsucești cheia", body: <ul><li><strong>Nimic sau doar un clic:</strong> de obicei bateria descărcată sau o bornă slăbită.</li><li><strong>Demarorul se învârte, motorul nu pornește:</strong> combustibil, bujii sau injecție.</li><li><strong>Martorul de imobilizator clipește:</strong> cheia nu e recunoscută — încearcă cheia de rezervă.</li></ul> },
      { h2: "Ce poți încerca în siguranță", body: <ul><li>pornire cu cabluri, de la altă mașină, respectând ordinea bornelor din manual;</li><li>verifică nivelul de combustibil — indicatorul poate minți;</li><li>nu insista mai mult de câteva încercări scurte: descarci bateria și forțezi demarorul.</li></ul> },
      { h2: "Când e mai bine tractarea", body: <p>Când ai miros de benzină, fum, martorul de ulei sau de temperatură aprins, ori zgomote metalice — nu mai porni mașina. Calculează prețul până la service în <L href="/calculator/">calculator</L>.</p> },
    ],
    faq: [{ q: "Pot tracta cu coarda o mașină care nu pornește?", a: "Pe distanțe scurte e posibil, dar fără servodirecție și servofrână asistate mașina e greu de controlat; pentru cutii automate nu e recomandat. Pe platformă e cel mai sigur." }],
    related: ["ghid/tractare-cutie-automata", "tractari-sectoare-bucuresti", "tractari-non-stop-bucuresti"],
  },
  {
    slug: "ghid/tractare-cutie-automata",
    group: "ghid",
    nav: "Ghid: cutie automată",
    title: "Mașină cu cutie automată: tractare pe platformă",
    description: "De ce o mașină cu cutie automată se transportă pe platformă, nu tractată cu roțile pe drum, și ce verifici înainte: frâna de mână, modul N, cheia.",
    h1: "Mașina are cutie automată? De ce se transportă pe platformă",
    lead: "La multe cutii automate, rotirea roților de tracțiune cu motorul oprit poate deteriora transmisia. Platforma evită problema.",
    examples: [],
    sections: [
      { h2: "De ce nu cu roțile pe drum", body: <p>La multe cutii automate, ungerea transmisiei depinde de pompa care funcționează doar cu motorul pornit. Tractată cu roțile motoare pe drum, cutia se poate încălzi și deteriora. Manualul mașinii spune exact ce permite producătorul.</p> },
      { h2: "Ce faci înainte de încărcare", body: <ul><li>ai la tine cheia sau cardul — unele mașini nu ies din P fără contact;</li><li>caută în manual procedura de deblocare a schimbătorului (shift lock) dacă bateria e descărcată;</li><li>spune-ne dacă frâna de mână electrică nu se eliberează.</li></ul> },
      { h2: "Cât costă", body: <p>La fel ca orice transport pe platformă: tipul vehiculului și kilometrii. Vezi <L href="/tarife-tractari/">tarifele</L>.</p> },
    ],
    faq: [{ q: "Și mașinile electrice?", a: "Și ele se transportă de regulă pe platformă; verifică în manual dacă există un mod de transport." }],
    related: ["ghid/masina-nu-porneste", "transport-auto-pe-platforma", "tarife-tractari"],
  },
];

export const LOCAL_LANDINGS: Landing[] = [...primaryPages, ...placePages, ...sectorPages, ...extraPages];

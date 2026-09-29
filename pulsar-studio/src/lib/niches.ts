/**
 * NIȘE — o pagină pe intenție de căutare.
 *
 * De ce fiecare are text propriu, nu un șablon cu un cuvânt schimbat:
 * Google numește „doorway pages" paginile care diferă doar prin cuvântul
 * cheie, le tratează ca spam și poate retrograda tot domeniul. O pagină
 * merită să existe doar dacă spune ceva ce celelalte nu spun — aici,
 * problemele reale ale afacerii respective și ce trebuie să aibă site-ul ei.
 *
 * Nimic din ce scrie mai jos nu inventează clienți, rezultate sau cifre
 * despre noi. Sunt descrieri ale nevoilor fiecărui domeniu și ale a ceea ce
 * construim — lucruri verificabile, nu promisiuni.
 */

export type NicheCategory =
  | "Sport și agrement"
  | "Auto"
  | "HoReCa"
  | "Comerț"
  | "Sănătate și frumusețe"
  | "Construcții";

export type Niche = {
  slug: string;
  category: NicheCategory;
  /** Pentru titluri de card și meniu. */
  label: string;
  /** Forma din mijlocul propoziției: „un site pentru …”. */
  name: string;
  h1: string;
  title: string;
  description: string;
  lead: string;
  /** Ce pierde afacerea fără un site ca lumea. Trei, nu mai multe. */
  problems: { title: string; body: string }[];
  /** Secțiunile fără de care site-ul nu-și face treaba. */
  mustHave: { title: string; body: string }[];
  /** Integrări și detalii tehnice specifice domeniului. */
  extras: string[];
  faq: { q: string; a: string }[];
  /** Pachetul care acoperă, de regulă, un astfel de proiect. */
  recommended: string;
  related: string[];
};

export const niches: Niche[] = [
  // -------------------------------------------------------------------------
  // SPORT ȘI AGREMENT
  // -------------------------------------------------------------------------
  {
    slug: "balti-de-pescuit",
    category: "Sport și agrement",
    label: "Bălți de pescuit",
    name: "o baltă de pescuit",
    h1: "Creare site pentru bălți de pescuit",
    title: "Creare site pentru bălți de pescuit | Rezervări standuri",
    description:
      "Site pentru balta ta de pescuit: harta standurilor, tarife pe zi și pe noapte, regulament, specii populate și rezervare online. Vezi ce include și cât costă.",
    lead:
      "Majoritatea bălților din România se administrează dintr-un grup de Facebook și un telefon care sună de dimineața până seara, cu aceleași cinci întrebări. Un site le răspunde o dată, pentru toată lumea, și îți lasă telefonul liber pentru pescarii care chiar au nevoie de tine.",
    problems: [
      {
        title: "Aceleași întrebări, de zeci de ori pe zi",
        body: "Ce specii ai populat, cât costă o noapte, se poate cu barca, se reține pește, e curent la stand. Fiecare răspuns durează două minute la telefon și zero secunde pe un site scris o singură dată.",
      },
      {
        title: "Nimeni nu știe dacă mai e loc",
        body: "Pescarul sună ca să afle dacă are unde trage. Dacă nu răspunzi în două minute, sună la balta următoare. O hartă cu standurile libere rezolvă asta fără să ridici telefonul.",
      },
      {
        title: "Pozele bune se pierd în grup",
        body: "Capturile pe care le postează pescarii sunt cea mai bună reclamă pe care o ai, dar în Facebook dispar după o săptămână. Pe site rămân, se indexează și lucrează pentru tine tot anul.",
      },
    ],
    mustHave: [
      {
        title: "Harta standurilor",
        body: "Plan cu numerotarea reală a standurilor, ce are fiecare (curent, umbrar, acces mașină, distanță până la apă) și care sunt ocupate în perioada aleasă.",
      },
      {
        title: "Tarife limpezi, pe tip de permis",
        body: "Zi, noapte, 24 de ore, abonament de sezon, tarif pentru însoțitor, tarif copii. Scrise ca tabel, nu ca paragraf — pescarul compară în trei secunde.",
      },
      {
        title: "Regulamentul bălții",
        body: "Captură reținută sau catch and release, nade permise, număr de undițe, ore de liniște, acces cu mașina. Pus pe site, devine o regulă pe care ai unde s-o arăți, nu o discuție la fața locului.",
      },
      {
        title: "Ce s-a populat și când",
        body: "Speciile din baltă, cantitățile populate și data ultimei populări. E informația după care pescarii aleg balta, și e exact ce nu găsesc pe site-urile concurenței.",
      },
      {
        title: "Rezervare de stand",
        body: "Formular cu data, standul ales și datele de contact, care îți ajunge pe WhatsApp sau pe email. Cu avans, dacă vrei să filtrezi rezervările care nu se prezintă.",
      },
      {
        title: "Cum ajungi",
        body: "Coordonate GPS, link direct către Waze și Google Maps, starea drumului de acces pe ultimii kilometri. Sună banal până când pierzi un client care s-a împotmolit pe un drum de pământ.",
      },
    ],
    extras: [
      "Galerie cu capturi, actualizată din telefon",
      "Program pe sezon și zile de repaus",
      "Facilități: cabane, foișoare, parcare, curent",
      "Concursuri și clasamente",
    ],
    faq: [
      {
        q: "Pot actualiza singur ce standuri sunt libere?",
        a: "Da. Îți lăsăm o zonă de administrare simplă, unde bifezi standurile ocupate pentru o anumită perioadă. Nu are nevoie de cunoștințe tehnice — se face de pe telefon.",
      },
      {
        q: "Se poate încasa avansul online?",
        a: "Da, se poate adăuga plata cu cardul pentru avansul la rezervare. Presupune un cont la un procesator de plăți pe firma ta; îți explicăm pașii și facem integrarea.",
      },
      {
        q: "Am deja un grup de Facebook cu mulți membri. Îmi mai trebuie site?",
        a: "Grupul e bun pentru comunitatea care te știe deja. Site-ul e pentru pescarul care caută „baltă de pescuit” plus numele județului în Google și nu a auzit niciodată de tine. Sunt doi oameni diferiți.",
      },
      {
        q: "Cât durează?",
        a: "Un site de baltă cu hartă, tarife, regulament și formular de rezervare se încadrează de regulă în pachetul Business. Termenul exact îl stabilim după ce vedem câte standuri ai și ce vrei să poți modifica singur.",
      },
    ],
    recommended: "business",
    related: ["terenuri-de-padel", "pensiuni-turistice", "baze-de-inot"],
  },
  {
    slug: "terenuri-de-padel",
    category: "Sport și agrement",
    label: "Terenuri de padel",
    name: "un club de padel",
    h1: "Creare site pentru terenuri de padel",
    title: "Creare site pentru terenuri de padel | Rezervări online",
    description:
      "Site pentru clubul tău de padel: rezervare pe ore și pe teren, abonamente, închiriere de echipament, turnee și căutare de parteneri. Vezi ce include.",
    lead:
      "Padelul a crescut în România mai repede decât site-urile cluburilor. Cele mai multe terenuri se rezervă încă pe WhatsApp, într-un grup unde cineva scrie „mâine la 19, mai e loc?” și așteaptă. Un site cu rezervare reală îți umple orele moarte fără ca nimeni să mai scrie mesaje.",
    problems: [
      {
        title: "Rezervările pe WhatsApp se pierd",
        body: "Două persoane cer același interval, cineva uită să noteze, terenul rămâne gol la 18:00 într-o marți. Un calendar care blochează automat ora rezervată nu face greșeala asta.",
      },
      {
        title: "Orele de peste zi rămân goale",
        body: "Toată lumea vrea între 18 și 21. Un site care arată prețul mai mic de la prânz și lasă rezervarea la un click transformă intervalele moarte în ore vândute.",
      },
      {
        title: "Jucătorii nu găsesc cu cine să joace",
        body: "Padelul se joacă în patru. Un jucător singur care nu-și găsește pereche nu rezervă deloc. O secțiune de căutare de parteneri, cu nivel de joc, umple terenuri pe care altfel nu le-ar fi rezervat nimeni.",
      },
    ],
    mustHave: [
      {
        title: "Calendar de rezervări pe teren și pe oră",
        body: "Vede intervalele libere pe fiecare teren, alege, confirmă. Ora se blochează pe loc, iar tu primești rezervarea pe email sau WhatsApp.",
      },
      {
        title: "Tarife pe interval",
        body: "Preț diferit dimineața, la prânz și seara, în weekend față de zilele lucrătoare. Afișat în calendar, lângă oră, nu ascuns într-o listă separată.",
      },
      {
        title: "Abonamente și rezervări recurente",
        body: "Jucătorii care vin în fiecare marți la 20 sunt venitul tău stabil. Le dai o rezervare care se repetă și un abonament care se cumpără o dată.",
      },
      {
        title: "Închiriere de rachete și mingi",
        body: "Bifă la rezervare, cu preț. Îi scutește pe începători de o întrebare și pe tine de un telefon.",
      },
      {
        title: "Turnee și ligă internă",
        body: "Calendar de turnee, formular de înscriere pe echipe, clasament. E ce transformă un teren închiriat într-un club cu oameni care revin.",
      },
      {
        title: "Caut parteneri",
        body: "Anunțuri cu ziua, ora și nivelul de joc. Cea mai ieftină formă de umplere a terenurilor, pentru că o fac jucătorii între ei.",
      },
    ],
    extras: [
      "Politica de anulare, aplicată automat",
      "Tur foto al terenurilor și al vestiarelor",
      "Rezervare din telefon, în două atingeri",
      "Legătură cu antrenorii și lecțiile individuale",
    ],
    faq: [
      {
        q: "Calendarul chiar blochează ora, sau doar trimite o cerere?",
        a: "Cum alegi. Varianta simplă trimite o cerere pe care o confirmi tu. Varianta completă blochează intervalul pe loc, ca la un sistem de rezervări adevărat — costă mai mult, dar elimină suprapunerile.",
      },
      {
        q: "Pot avea mai multe terenuri, cu prețuri diferite?",
        a: "Da. Fiecare teren are programul și tariful lui, inclusiv terenuri acoperite cu preț diferit iarna.",
      },
      {
        q: "Se poate plăti online?",
        a: "Da, se poate adăuga plata cu cardul la rezervare sau la cumpărarea abonamentului. E nevoie de un cont la un procesator de plăți pe firma ta.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Un club cu rezervare reală, abonamente și turnee intră de regulă în Pro. Dacă vrei doar prezentare și un formular de cerere, pachetul Business e suficient.",
      },
    ],
    recommended: "pro",
    related: ["terenuri-de-tenis", "baze-de-inot", "sali-de-fitness"],
  },
  {
    slug: "baze-de-inot",
    category: "Sport și agrement",
    label: "Bazine și școli de înot",
    name: "un bazin de înot",
    h1: "Creare site pentru bazine și școli de înot",
    title: "Creare site pentru bazine de înot | Program și înscrieri",
    description:
      "Site pentru bazinul tău: program pe zile, culoare libere, abonamente, cursuri de înot pe grupe de vârstă și înscriere online. Vezi ce include și cât costă.",
    lead:
      "La un bazin, aproape toate telefoanele sunt despre două lucruri: când e liber și cât costă abonamentul. Amândouă se rezolvă cu o pagină scrisă o dată — iar înscrierile la cursurile de copii, care sunt partea cu adevărat profitabilă, ajung să se facă singure.",
    problems: [
      {
        title: "Programul se schimbă și nimeni nu află",
        body: "Se închide un culoar pentru antrenamente, se decalează programul în vacanță. Dacă nu are unde să verifice, omul vine degeaba o dată și nu mai revine.",
      },
      {
        title: "Cursurile de copii se vând pe încredere",
        body: "Un părinte nu-și dă copilul pe mâna unui nume de pe un afiș. Vrea să vadă instructorii, mărimea grupei, adâncimea apei și cum arată vestiarul. Fără astea, sună la altă piscină.",
      },
      {
        title: "Regulile aflate la casă supără",
        body: "Adeverință medicală, cască obligatorie, papuci, ce se întâmplă dacă lipsești de la o ședință. Omul care află la ghișeu că nu poate intra pleacă nervos. Cel care a citit pe site vine pregătit.",
      },
    ],
    mustHave: [
      {
        title: "Programul, pe zile și pe intervale",
        body: "Când e acces public, când sunt culoare rezervate, când sunt cursuri. Cu mențiunile de vacanță și sărbători, care sunt exact momentele în care oamenii caută.",
      },
      {
        title: "Abonamente și tarife",
        body: "Intrare simplă, abonament de 4 sau 8 intrări, abonament lunar, tarif copii, tarif însoțitor. Tabel, nu proză.",
      },
      {
        title: "Cursuri de înot pe grupe",
        body: "Vârsta, nivelul, numărul de copii în grupă, durata ședinței, ce include. Cu instructorul afișat, nu anonim — e singura garanție pe care o poate evalua un părinte înainte să plătească.",
      },
      {
        title: "Înscriere online la curs",
        body: "Formular cu grupa aleasă, vârsta copilului și datele părintelui, care îți ajunge direct. Cu listă de așteptare, când grupa e plină.",
      },
      {
        title: "Regulament și condiții de acces",
        body: "Adeverința medicală, echipamentul obligatoriu, regulile de igienă, politica de recuperare a ședințelor. Scrise o dată, la vedere.",
      },
      {
        title: "Galerie reală",
        body: "Bazinul, vestiarele, dușurile. Fotografii adevărate, nu imagini de stoc cu piscine din alte țări — părinții își dau seama imediat și pleacă.",
      },
    ],
    extras: [
      "Parametrii apei și programul de igienizare",
      "Facilități: saună, jacuzzi, sală, parcare",
      "Evenimente: concursuri, aniversări pentru copii",
      "Formular pentru abonament corporate",
    ],
    faq: [
      {
        q: "Pot schimba singur programul când se decalează?",
        a: "Da. Programul stă într-un loc pe care îl editezi fără să umbli prin site, iar modificarea apare imediat pe toate paginile unde e afișat.",
      },
      {
        q: "Se pot face înscrieri cu plată online la cursuri?",
        a: "Da, se poate adăuga plata cu cardul pentru rata sau pentru pachetul de ședințe. Necesită un cont la un procesator de plăți pe firma ta.",
      },
      {
        q: "Avem și sală de fitness în aceeași clădire. Pot fi pe același site?",
        a: "Da, și e chiar recomandat: împart același public, iar abonamentul combinat se vinde mai bine când se vede pe aceeași pagină.",
      },
      {
        q: "Ce pachet acoperă asta?",
        a: "Un bazin cu program, tarife, cursuri și formular de înscriere intră de regulă în Business. Dacă adaugi rezervare de culoare și plată online, ajungi la Pro.",
      },
    ],
    recommended: "business",
    related: ["sali-de-fitness", "terenuri-de-padel", "terenuri-de-tenis"],
  },
  {
    slug: "terenuri-de-tenis",
    category: "Sport și agrement",
    label: "Terenuri de tenis",
    name: "o bază de tenis",
    h1: "Creare site pentru terenuri de tenis",
    title: "Creare site pentru terenuri de tenis | Rezervări și școală",
    description:
      "Site pentru baza ta de tenis: rezervare pe teren și suprafață, tarife pe interval, antrenori, școală de tenis și politica de anulare pe ploaie.",
    lead:
      "Tenisul are o problemă pe care padelul nu o are: vremea. Jumătate din telefoanele primite de o bază cu terenuri de zgură sunt despre dacă se poate juca azi. Un site care spune limpede ce se întâmplă cu rezervarea pe ploaie rezolvă asta și scade numărul de discuții neplăcute la recepție.",
    problems: [
      {
        title: "Ploaia strică rezervările",
        body: "Dacă politica de anulare nu e scrisă nicăieri, fiecare zi ploioasă înseamnă negocieri la recepție. Scrisă pe site și afișată la rezervare, devine o regulă acceptată dinainte.",
      },
      {
        title: "Zgură sau hard, nu e totuna",
        body: "Jucătorii aleg suprafața. Dacă site-ul nu spune ce ai, câte terenuri și care sunt acoperite iarna, pierzi exact jucătorii care știu ce vor.",
      },
      {
        title: "Antrenorii nu apar nicăieri",
        body: "Lecțiile individuale și școala de tenis pentru copii aduc mai mult decât închirierea seacă a terenului. Dacă antrenorii nu au fiecare o prezentare, părinții nu au ce compara.",
      },
    ],
    mustHave: [
      {
        title: "Rezervare pe teren și suprafață",
        body: "Calendar pe intervale, cu suprafața și mențiunea dacă terenul e acoperit sau cu nocturnă. Alegi, confirmi, ora se blochează.",
      },
      {
        title: "Tarife pe interval și pe sezon",
        body: "Zgură vara, balon iarna, nocturnă cu supliment, tarif de weekend. Tabel clar, cu toate cazurile.",
      },
      {
        title: "Politica de anulare pe vreme rea",
        body: "Cât timp înainte se poate anula, ce se întâmplă dacă plouă la ora rezervării, cum se recuperează. La vedere, nu în subsol.",
      },
      {
        title: "Antrenori și școală de tenis",
        body: "Pagina fiecărui antrenor, grupele de copii pe vârste, prețul unei ședințe individuale, formular de înscriere. Aici se decide părintele.",
      },
      {
        title: "Turnee și competiții interne",
        body: "Calendar, regulament, înscriere online, rezultate. E ce ține jucătorii legați de bază în loc să caute alta.",
      },
      {
        title: "Facilități",
        body: "Vestiare, dușuri, magazin cu corzi și accesorii, service de rachete, parcare. Detaliile care fac diferența între două baze cu același preț.",
      },
    ],
    extras: [
      "Nocturnă și program de iarnă sub balon",
      "Închiriere de rachete pentru începători",
      "Abonamente pentru jucători constanți",
      "Anunțuri pentru căutare de parteneri de joc",
    ],
    faq: [
      {
        q: "Putem afișa automat dacă terenurile sunt jucabile?",
        a: "Putem afișa starea pe care o setezi tu dimineața, dintr-un singur buton. Nu recomandăm să fie legată automat de prognoză: prognoza greșește, iar tu ai rămâne cu rezervări anulate degeaba.",
      },
      {
        q: "Avem și terenuri de padel. Le putem pune împreună?",
        a: "Da, pe același site, cu calendare separate. Mulți jucători trec de la unul la altul, iar o singură bază care le are pe amândouă are un avantaj pe care merită să-l arate.",
      },
      {
        q: "Se poate plăti online?",
        a: "Da, pentru rezervări și abonamente. Necesită un cont la un procesator de plăți pe firma ta.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Prezentare cu tarife, antrenori și formular de rezervare — Business. Calendar cu blocare automată a orelor și plată online — Pro.",
      },
    ],
    recommended: "business",
    related: ["terenuri-de-padel", "sali-de-fitness", "baze-de-inot"],
  },
  {
    slug: "sali-de-fitness",
    category: "Sport și agrement",
    label: "Săli de fitness",
    name: "o sală de fitness",
    h1: "Creare site pentru săli de fitness",
    title: "Creare site pentru săli de fitness | Abonamente și clase",
    description:
      "Site pentru sala ta: abonamente și tarife, orar de clase, antrenori, tur foto și înscriere online. Vezi ce include un site care aduce membri.",
    lead:
      "Omul care caută o sală compară trei lucruri: cât costă, ce clase are la ora la care poate veni și cum arată înăuntru. Dacă nu le găsește pe site în treizeci de secunde, deschide pagina sălii următoare. Atât durează decizia.",
    problems: [
      {
        title: "Prețul ascuns alungă",
        body: "Sălile care scriu „sună pentru ofertă” pierd majoritatea căutărilor. Omul presupune că e scump și pleacă. Prețul afișat filtrează, dar aduce oameni care știu deja ce cumpără.",
      },
      {
        title: "Orarul de clase pe o poză din Instagram",
        body: "Se citește prost pe telefon, se pierde în feed și e vechi de două săptămâni. Un orar pe site e lizibil, actual și îl găsește Google.",
      },
      {
        title: "Nu se vede sala",
        body: "Fără fotografii reale ale aparatelor, vestiarelor și spațiului de funcțional, nimeni nu știe dacă merită drumul. Pozele de stoc se recunosc și strică încrederea.",
      },
    ],
    mustHave: [
      {
        title: "Abonamente și tarife",
        body: "Lunar, trimestrial, anual, student, acces în intervalul de zi. Cu ce include fiecare, într-un tabel pe care îl compari dintr-o privire.",
      },
      {
        title: "Orarul claselor",
        body: "Pe zile și pe săli, cu antrenorul și durata. Editabil de tine, ca să nu rămână vechi din a doua săptămână.",
      },
      {
        title: "Antrenorii",
        body: "Specializare, experiență, cu cine lucrează. Antrenamentul personal se vinde de pe pagina antrenorului, nu de pe pagina sălii.",
      },
      {
        title: "Tur foto real",
        body: "Zona de greutăți, cardio, funcțional, vestiare, dușuri. Fotografiate la tine în sală, la ora la care arată cel mai bine.",
      },
      {
        title: "Înscriere și prima ședință",
        body: "Formular scurt pentru ședința de probă sau pentru abonament, care îți ajunge imediat. Cu cât are mai puține câmpuri, cu atât îl completează mai mulți.",
      },
      {
        title: "Program și acces",
        body: "Orarul sălii, inclusiv sărbători, plus parcare și acces cu transportul în comun. Întrebări banale care se pun de zeci de ori pe lună.",
      },
    ],
    extras: [
      "Rezervare de loc la clasele cu număr limitat",
      "Abonamente corporate pentru firme din zonă",
      "Legătură cu aplicația de acces, dacă folosești una",
      "Pagini separate pentru fiecare locație",
    ],
    faq: [
      {
        q: "Avem mai multe săli în oraș. Se poate un singur site?",
        a: "Da, cu o pagină pe locație — program, orar și fotografii proprii. E și mai bine pentru Google decât un site care le amestecă, pentru că fiecare pagină poate ieși pe căutarea cu numele cartierului.",
      },
      {
        q: "Putem vinde abonamente online?",
        a: "Da, se poate adăuga plata cu cardul. Necesită un cont la un procesator de plăți pe firma ta.",
      },
      {
        q: "Orarul se schimbă des. E complicat de actualizat?",
        a: "Nu. Îl editezi dintr-un singur loc, ca pe un tabel, iar modificarea apare peste tot unde e afișat.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Prezentare, abonamente, orar, antrenori și formular — pachetul Business acoperă bine. Rezervarea locului la clase și plata online urcă proiectul la Pro.",
      },
    ],
    recommended: "business",
    related: ["baze-de-inot", "terenuri-de-padel", "saloane-de-infrumusetare"],
  },

  // -------------------------------------------------------------------------
  // AUTO
  // -------------------------------------------------------------------------
  {
    slug: "detailing-auto",
    category: "Auto",
    label: "Detailing auto",
    name: "un atelier de detailing",
    h1: "Creare site pentru detailing auto",
    title: "Creare site pentru detailing auto | Portofoliu și programări",
    description:
      "Site pentru atelierul tău de detailing: înainte și după pe fiecare pachet, tarife pe clasă de mașină, programare online și garanția protecției ceramice.",
    lead:
      "Detailingul se vinde cu ochii. Nimeni nu plătește o mie de lei pe o corecție de vopsea dintr-un text — plătește după ce vede o aripă pe jumătate lustruită, în lumină rece, la tine în atelier. Un site de detailing fără fotografii înainte și după nu e un site, e un pliant.",
    problems: [
      {
        title: "Clientul nu știe ce cumpără",
        body: "Polish, corecție într-un pas, corecție în doi pași, ceramică, PPF — pentru un om normal sunt cuvinte fără sens. Fiecare are nevoie de o explicație scurtă și de o fotografie care arată diferența.",
      },
      {
        title: "Prețul depinde de mașină, deci nu e scris nicăieri",
        body: "E adevărat că un SUV negru cu zgârieturi nu costă cât un hatchback alb. Dar „preț la cerere” peste tot înseamnă că nimeni nu te sună. Un interval pe clasă de mașină aduce clienți care știu la ce să se aștepte.",
      },
      {
        title: "Programările se pierd între mesaje",
        body: "Detailingul ocupă atelierul o zi sau trei. Dacă programările vin pe Instagram, Facebook și telefon, ajungi să suprapui două mașini pe același loc.",
      },
    ],
    mustHave: [
      {
        title: "Galerie înainte și după",
        body: "Pe fiecare tip de lucrare, cu aceeași mașină, aceeași lumină și aceeași ramă. E singura dovadă care vinde detailing, și trebuie să fie a ta, nu descărcată de pe internet.",
      },
      {
        title: "Pachete explicate pe înțeles",
        body: "Ce cuprinde fiecare pachet, cât durează, ce nu cuprinde. Un om care înțelege ce cumpără nu se mai târguiește.",
      },
      {
        title: "Tarife pe clasă de mașină",
        body: "Citadină, break, SUV, mașină de lux. Un interval, nu un preț fix — cinstit și util în același timp.",
      },
      {
        title: "Programare online cu durată",
        body: "Formular care cere modelul, starea vopselei și pachetul dorit, ca să știi dinainte dacă mașina îți ocupă atelierul o zi sau trei.",
      },
      {
        title: "Garanția protecției ceramice",
        body: "Câți ani, ce acoperă, ce o anulează, ce întreținere cere. Scris negru pe alb, e argumentul care închide vânzarea la pachetele scumpe.",
      },
      {
        title: "Recenzii adevărate",
        body: "Recenziile de pe Google, aduse pe site. Nu inventate — clienții de detailing verifică, iar o recenzie falsă descoperită costă mai mult decât aduce.",
      },
    ],
    extras: [
      "Servicii separate: foliere PPF, curățare tapițerie, tratament faruri",
      "Abonamente de întreținere pentru clienții cu ceramică",
      "Pagină pentru flote și firme de leasing",
      "Voucher cadou pentru pachete",
    ],
    faq: [
      {
        q: "Nu am poze bune înainte și după. Ce fac?",
        a: "Îți spunem exact cum să le faci: aceeași poziție, aceeași lumină, jumătate de panou lucrat și jumătate nu. Nu e nevoie de aparat scump — un telefon recent și lumina potrivită sunt de ajuns.",
      },
      {
        q: "Pot ascunde prețurile de concurență?",
        a: "Poți, dar te costă mai mult decât îți aduce. Concurența îți află prețul oricum, cu un telefon. Clientul care nu-l găsește, pleacă.",
      },
      {
        q: "Se poate încasa un avans la programare?",
        a: "Da, se poate adăuga plata cu cardul pentru avans — e cea mai simplă metodă de a reduce programările la care nu se prezintă nimeni. Necesită un cont la un procesator de plăți pe firma ta.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Un site de detailing cu galerie pe pachete, tarife și programare intră de regulă în Business. Dacă vrei magazin cu produse de întreținere, ajungi la Pro.",
      },
    ],
    recommended: "business",
    related: ["service-auto", "tractari-auto", "magazine-online"],
  },
  {
    slug: "tractari-auto",
    category: "Auto",
    label: "Tractări auto",
    name: "o firmă de tractări",
    h1: "Creare site pentru tractări auto",
    title: "Creare site pentru tractări auto | Apel rapid, non-stop",
    description:
      "Site pentru firma ta de tractări: buton de apel mereu la vedere, zona acoperită, tarife orientative pe km și tipurile de platformă. Construit pentru telefon.",
    lead:
      "Un site de tractări are un singur scop și un singur ecran în care să-l atingă: omul e pe marginea drumului, cu o mașină care nu merge, cu 12% baterie și nervii întinși. Dacă trebuie să caute numărul de telefon, ai pierdut clientul. Butonul de apel trebuie să fie primul lucru pe care îl vede și singurul care nu dispare la derulare.",
    problems: [
      {
        title: "Numărul e greu de găsit",
        body: "Pe majoritatea site-urilor de tractări, telefonul e în subsol sau într-o imagine. Omul care a rămas în pană nu derulează. Sună la firma care i-a pus numărul în față.",
      },
      {
        title: "Nu se știe dacă acoperi zona",
        body: "„Tractări auto non-stop” nu spune nimănui dacă vii până la el. Zona acoperită, scrisă pe județe și cu un timp estimat, elimină telefoanele degeaba — ale lui și ale tale.",
      },
      {
        title: "Prețul necunoscut sperie",
        body: "Nimeni nu vrea să afle suma după ce mașina e deja pe platformă. Un tarif orientativ, cu taxa de deplasare și prețul pe kilometru, câștigă clientul care a sunat înainte la trei firme.",
      },
    ],
    mustHave: [
      {
        title: "Buton de apel fix pe ecran",
        body: "Vizibil în permanență pe telefon, în partea de jos, cu numărul real și apelare la o atingere. Nimic nu contează mai mult pe acest site.",
      },
      {
        title: "Zona acoperită",
        body: "Județele și orașele în care ajungi, plus un timp estimat de sosire. Onest: dacă la 80 de kilometri ajungi într-o oră și jumătate, asta se scrie.",
      },
      {
        title: "Tarife orientative",
        body: "Taxă de deplasare, preț pe kilometru, supliment de noapte sau de weekend, tarif pentru scoaterea din șanț. Intervale, nu prețuri fixe.",
      },
      {
        title: "Ce poți tracta",
        body: "Autoturisme, SUV-uri, autoutilitare, motociclete, utilaje, mașini cu cutie automată sau cu roți blocate. Fiecare caz special e un client care altfel ar fi sunat în altă parte.",
      },
      {
        title: "Non-stop, scris ca atare",
        body: "Dacă lucrezi 24 din 24, asta e principalul tău argument și trebuie să apară lângă număr, nu într-un paragraf de la mijlocul paginii.",
      },
      {
        title: "Asistență rutieră și RCA",
        body: "Dacă lucrezi cu asigurători sau oferi asistență la pornire, schimb de roată, alimentare, transport pe platformă la ITP — fiecare e o pagină separată care poate ieși singură în Google.",
      },
    ],
    extras: [
      "Buton de WhatsApp cu locația trimisă automat",
      "Pagini pe oraș, pentru căutările locale",
      "Formular pentru firme și flote, cu decont lunar",
      "Legătură directă către Waze pentru echipaj",
    ],
    faq: [
      {
        q: "Site-ul va fi rapid pe o conexiune slabă?",
        a: "Da, și e o cerință, nu un bonus. Site-ul e construit ca prima pagină să se vadă repede și pe o conexiune proastă, pentru că exact acolo e clientul tău — pe marginea drumului, nu pe wi-fi.",
      },
      {
        q: "Merită pagini separate pe fiecare oraș?",
        a: "Da, dacă acoperi mai multe orașe și ai ce scrie despre fiecare. O pagină pe oraș, cu informație reală, poate ieși în căutarea „tractări auto” plus numele orașului. Pagini identice cu orașul schimbat sunt considerate spam de Google și fac rău.",
      },
      {
        q: "Cât de repede poate fi gata?",
        a: "Un site de tractări e, din fericire, simplu: câteva pagini, foarte bine făcute. E printre cele mai rapide proiecte pe care le livrăm.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Pachetul Starter acoperă un site de tractări bine făcut. Business, dacă vrei pagini separate pe oraș și pe fiecare serviciu de asistență rutieră.",
      },
    ],
    recommended: "starter",
    related: ["service-auto", "detailing-auto", "firme-de-constructii"],
  },
  {
    slug: "service-auto",
    category: "Auto",
    label: "Service auto",
    name: "un service auto",
    h1: "Creare site pentru service auto",
    title: "Creare site pentru service auto | Programări și tarife",
    description:
      "Site pentru service-ul tău: programare pe tip de intervenție, tarife de manoperă, mărci deservite, ITP și revizii. Vezi ce include și cât costă.",
    lead:
      "Un service auto trăiește din încredere și din programări. Site-ul nu-ți repară mașinile, dar îți poate umple graficul cu oameni care știu deja ce vin să facă, în loc de telefoane în care explici de zece ori pe zi cât costă o revizie.",
    problems: [
      {
        title: "Telefonul sună pentru aceleași trei lucruri",
        body: "Cât costă revizia, faceți ITP, lucrați pe marca mea. Trei pagini bine scrise răspund la toate și îți lasă timp pentru munca din hală.",
      },
      {
        title: "Nu se știe pe ce mărci lucrezi",
        body: "Un om cu o mașină germană nu sună la un service care pare specializat pe Dacia. Lista mărcilor deservite, scrisă explicit, aduce exact clienții pe care îi vrei.",
      },
      {
        title: "Devizul surpriză strică relația",
        body: "Clientul care află la ridicare o sumă dublă față de estimare nu mai revine. Tarifele de manoperă afișate și un deviz trimis înainte de lucrare rezolvă asta.",
      },
    ],
    mustHave: [
      {
        title: "Servicii, fiecare cu pagina lui",
        body: "Revizie, distribuție, frâne, climatizare, diagnoză, ITP. Fiecare e o căutare separată în Google și merită o pagină care îi răspunde.",
      },
      {
        title: "Tarife de manoperă",
        body: "Pe oră sau pe operație, cu intervalele obișnuite. Nu te obligă la nimic, dar îți aduce clienți care nu se mai sperie de prima sumă.",
      },
      {
        title: "Programare online",
        body: "Formular cu marca, modelul, anul, kilometrajul și ce vrea clientul. Vii la lucru cu graficul zilei deja știut.",
      },
      {
        title: "Mărci și specializări",
        body: "Ce deservești, ce aparatură de diagnoză ai, ce nu faci. Onestitatea despre ce nu faci economisește timp în ambele părți.",
      },
      {
        title: "Piese și garanție",
        body: "Lucrezi cu piese originale, aftermarket, sau cu piesa clientului. Ce garanție dai la manoperă și la piesă. Sunt întrebările care decid alegerea.",
      },
      {
        title: "Program și localizare",
        body: "Orar, inclusiv sâmbăta, hartă, parcare, ce se întâmplă cu mașina peste noapte. Detalii mărunte care conving.",
      },
    ],
    extras: [
      "Pagină separată pentru ITP, cu programare",
      "Ofertă pentru firme și flote, cu decont lunar",
      "Mașină la schimb pe durata reparației",
      "Recenzii Google aduse pe site",
    ],
    faq: [
      {
        q: "Nu vreau să afișez prețuri. E obligatoriu?",
        a: "Nu e obligatoriu, dar un interval de manoperă aduce mai mulți clienți decât ascunde. Alternativa care funcționează bine: prețuri afișate pentru operațiile standard (revizie, ITP, schimb plăcuțe) și deviz pentru restul.",
      },
      {
        q: "Merită o pagină separată pentru fiecare intervenție?",
        a: "Da, dacă ai ce scrie despre fiecare. „Schimb distribuție” e o căutare reală, cu oameni care caută exact asta. O pagină scrisă serios pe acest subiect îți aduce clienți pe care pagina generală nu ți-i aduce.",
      },
      {
        q: "Putem trimite devizul prin site?",
        a: "Programarea vine prin site, devizul îl trimiți tu pe email sau WhatsApp. Un sistem complet de devize e o aplicație separată, nu un site de prezentare — putem discuta dacă ajungi acolo.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Un service cu pagini pe servicii, tarife și programare intră în Business. Starter, dacă vrei doar prezentare și contact.",
      },
    ],
    recommended: "business",
    related: ["detailing-auto", "tractari-auto", "magazine-online"],
  },

  // -------------------------------------------------------------------------
  // HORECA
  // -------------------------------------------------------------------------
  {
    slug: "shaormerie",
    category: "HoReCa",
    label: "Shaormerii",
    name: "o shaormerie",
    h1: "Creare site pentru shaormerie",
    title: "Creare site pentru shaormerie | Meniu și comenzi online",
    description:
      "Site pentru shaormeria ta: meniu cu preț și fotografii, comandă pe WhatsApp, zona de livrare, program și oferta zilei. Rapid pe telefon, unde se comandă.",
    lead:
      "Nouăzeci la sută din oamenii care caută shaorma o fac de pe telefon, flămânzi, la zece seara. Site-ul tău are treizeci de secunde să arate meniul, prețul și butonul de comandă. Tot ce încetinește pagina te costă o comandă.",
    problems: [
      {
        title: "Comisionul platformelor mănâncă marja",
        body: "Glovo și Bolt aduc volum, dar iau un procent serios din fiecare comandă. Un site propriu, cu comandă directă pe WhatsApp, îți aduce aceleași comenzi fără comision. Nu le înlocuiește — le completează.",
      },
      {
        title: "Meniul e o poză ilizibilă",
        body: "Un afiș fotografiat și urcat pe Facebook nu se citește pe telefon, nu poate fi căutat în Google și devine vechi la prima schimbare de preț. Un meniu scris ca text se citește, se indexează și se actualizează în două minute.",
      },
      {
        title: "Nu se știe până unde livrezi",
        body: "Fiecare comandă din afara zonei e un telefon pierdut și un client nervos. Zona de livrare, cu cartierele și taxa, scrisă la vedere, elimină problema.",
      },
    ],
    mustHave: [
      {
        title: "Meniu cu preț și fotografii",
        body: "Fiecare produs cu preț, gramaj și o fotografie făcută la tine. Nu imagini de stoc — se recunosc, și oamenii își dau seama că nu e ce primesc.",
      },
      {
        title: "Comandă cu un buton",
        body: "WhatsApp cu mesajul precompletat sau apel direct. Fără cont, fără parolă, fără formular lung. Fiecare câmp în plus înseamnă comenzi pierdute.",
      },
      {
        title: "Zona de livrare și taxa",
        body: "Cartierele acoperite, taxa pe fiecare, comanda minimă și timpul estimat. Scrise simplu, ca o listă.",
      },
      {
        title: "Programul, la vedere",
        body: "Inclusiv până la ce oră se poate comanda, care e diferit de ora închiderii. E cea mai căutată informație după preț.",
      },
      {
        title: "Oferta zilei",
        body: "Meniul zilei sau promoția curentă, pe care o schimbi singur, de pe telefon, în câteva secunde.",
      },
      {
        title: "Alergeni și ingrediente",
        body: "Obligatoriu prin lege pentru alimente, și în plus îți scutește personalul de întrebări la telefon.",
      },
    ],
    extras: [
      "Butoane către Glovo, Bolt Food și Tazz",
      "Pagini separate pe locație, dacă ai mai multe puncte",
      "Comenzi pentru birouri și grupuri",
      "Recenzii Google aduse pe site",
    ],
    faq: [
      {
        q: "Am deja pagină pe Glovo. Îmi mai trebuie site?",
        a: "Da, din două motive. Pe Glovo plătești comision la fiecare comandă; pe site, nu. Și în Glovo ești un rând într-o listă de zece shaormerii, pe când în Google, pentru căutarea cu numele cartierului tău, poți fi primul.",
      },
      {
        q: "Pot schimba singur prețurile?",
        a: "Da. Meniul stă într-un singur fișier de text, pe care îl editezi ca pe o listă. Nu trebuie să ne suni pentru fiecare leu.",
      },
      {
        q: "Vreau comandă online cu plata cardului, nu pe WhatsApp.",
        a: "Se poate — înseamnă coș, checkout și procesator de plăți, deci un proiect de magazin online, nu de site de prezentare. Îți recomandăm să începi cu WhatsApp și să treci la plata online când volumul o cere.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Starter acoperă o shaormerie cu un punct de lucru. Business, dacă ai mai multe locații sau vrei comenzi structurate.",
      },
    ],
    recommended: "starter",
    related: ["fast-food", "restaurante", "magazine-online"],
  },
  {
    slug: "fast-food",
    category: "HoReCa",
    label: "Fast food",
    name: "un fast food",
    h1: "Creare site pentru fast food",
    title: "Creare site pentru fast food | Meniu, livrare, locații",
    description:
      "Site pentru lanțul sau punctul tău de fast food: meniu pe categorii, comenzi online, pagini pe locație, catering pentru birouri și program.",
    lead:
      "Un fast food cu mai multe puncte de lucru are o problemă pe care o shaormerie nu o are: fiecare locație are alt program, altă zonă de livrare și, uneori, alt meniu. Un singur site care le amestecă frustrează pe toată lumea. Unul construit pe locații câștigă fiecare căutare cu numele cartierului.",
    problems: [
      {
        title: "O locație caută altfel decât alta",
        body: "Omul din Militari caută „fast food Militari”, nu numele lanțului tău. Dacă toate locațiile stau pe o singură pagină, nu ieși pe niciuna din căutările locale.",
      },
      {
        title: "Meniul mare devine de necitit",
        body: "Burgeri, wrapuri, meniuri combo, garnituri, băuturi, deserturi. Fără categorii și fără filtre, clientul renunță la jumătatea listei.",
      },
      {
        title: "Comenzile de grup se pierd la telefon",
        body: "O comandă pentru un birou de douăzeci de oameni, dictată la telefon, iese greșit. Un formular pentru comenzi mari, cu termen și factură, transformă asta într-un canal de venit stabil.",
      },
    ],
    mustHave: [
      {
        title: "Meniu pe categorii",
        body: "Structurat, cu preț, gramaj și fotografie. Cu meniurile combo evidențiate — de acolo vine marja.",
      },
      {
        title: "Pagină pentru fiecare locație",
        body: "Adresă, program propriu, zonă de livrare, hartă și telefon. Fiecare poate ieși singură în căutarea cu numele cartierului.",
      },
      {
        title: "Comandă online sau pe WhatsApp",
        body: "Direct, fără comisionul platformelor. Cu butoane și către Glovo sau Tazz, pentru clienții care preferă așa.",
      },
      {
        title: "Catering și comenzi pentru firme",
        body: "Formular separat, cu numărul de persoane, data, bugetul și factura pe firmă. E partea cea mai profitabilă și cea mai ignorată.",
      },
      {
        title: "Alergeni și valori nutriționale",
        body: "Cerute de lege pentru alimente, și tot mai căutate de clienți. Puse ordonat, sunt un avantaj, nu o corvoadă.",
      },
      {
        title: "Promoții și meniul zilei",
        body: "Editabile de tine, valabile pe toate locațiile sau doar pe unele.",
      },
    ],
    extras: [
      "Program de fidelizare, cu cod sau card",
      "Angajări: formular pentru CV-uri",
      "Franciză: pagină pentru cei care vor să deschidă",
      "Recenzii Google, pe fiecare locație",
    ],
    faq: [
      {
        q: "Am o singură locație deocamdată. Merită structura asta?",
        a: "Da, pentru că se extinde fără să reconstruim site-ul. Începi cu o locație și adaugi altele când deschizi, pe aceeași structură.",
      },
      {
        q: "Cum evit să am pagini identice pe fiecare locație?",
        a: "Nu le facem identice. Fiecare locație primește program propriu, zonă de livrare proprie, fotografii proprii și o descriere a cartierului. Paginile copiate cu numele schimbat sunt considerate spam de Google și fac rău întregului site.",
      },
      {
        q: "Se poate comandă online cu plata cardului?",
        a: "Da, dar e un magazin online, nu un site de prezentare — coș, checkout, procesator de plăți. Intră în pachetul Pro și necesită un cont de procesator pe firma ta.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Business pentru un lanț cu câteva locații, meniu și formular de catering. Pro, dacă adaugi comandă online cu plată.",
      },
    ],
    recommended: "business",
    related: ["shaormerie", "restaurante", "magazine-online"],
  },
  {
    slug: "restaurante",
    category: "HoReCa",
    label: "Restaurante",
    name: "un restaurant",
    h1: "Creare site pentru restaurante",
    title: "Creare site pentru restaurante | Meniu și rezervări online",
    description:
      "Site pentru restaurantul tău: meniu citibil, rezervare de masă, evenimente private, galerie și program. Construit pentru căutarea locală din Google.",
    lead:
      "Un restaurant se alege în zece secunde, de pe telefon, de obicei cu o oră înainte de masă. În acele zece secunde, omul vrea trei lucruri: să vadă meniul și prețurile, să vadă cum arată local, și să poată rezerva. Restul e decor.",
    problems: [
      {
        title: "Meniul în PDF",
        body: "Se descarcă greu, se citește prost pe telefon și nu-l vede Google. Un meniu scris ca text poate să apară direct în rezultatele căutării, cu preparate cu tot.",
      },
      {
        title: "Rezervările consumă personal",
        body: "Fiecare rezervare la telefon ocupă un om din sală în cel mai prost moment. Un formular de rezervare preia majoritatea lor fără să sune nimeni.",
      },
      {
        title: "Evenimentele private nu se văd nicăieri",
        body: "Botezuri, aniversări, mese de firmă la final de an — cele mai bune încasări ale anului. Dacă nu au pagina lor, cu capacitate și meniuri de grup, nu te caută nimeni pentru ele.",
      },
    ],
    mustHave: [
      {
        title: "Meniu ca text, nu ca imagine",
        body: "Pe categorii, cu preț, gramaj și alergeni. Actualizabil de tine, fără să ne suni la fiecare schimbare de sezon.",
      },
      {
        title: "Rezervare de masă",
        body: "Data, ora, numărul de persoane, o observație. Îți ajunge pe email sau WhatsApp, cu confirmare trimisă clientului.",
      },
      {
        title: "Galerie făcută la tine",
        body: "Sala, terasa, farfuriile tale. Fotografiile de stoc cu preparate care nu există în meniu sunt cel mai rapid mod de a pierde încrederea.",
      },
      {
        title: "Evenimente private",
        body: "Capacitatea sălilor, meniurile de grup, prețul pe persoană, formular de cerere de ofertă. O pagină separată, care se caută separat.",
      },
      {
        title: "Program, hartă, parcare",
        body: "Inclusiv programul de sărbători. Plus legătură cu profilul Google Business, care aduce cea mai mare parte a traficului local.",
      },
      {
        title: "Meniul zilei",
        body: "Dacă servești prânz, e pagina cea mai vizitată din site, în fiecare zi, la aceeași oră. Trebuie să o poți schimba în două minute.",
      },
    ],
    extras: [
      "Rezervare cu avans pentru grupuri mari",
      "Carduri cadou",
      "Comandă la pachet sau livrare",
      "Pagină de angajări",
    ],
    faq: [
      {
        q: "Profilul de Google Business îmi aduce deja clienți. Îmi trebuie site?",
        a: "Profilul și site-ul lucrează împreună: profilul te arată pe hartă, site-ul îi dă lui Google conținutul pe care să-l arate — meniul, prețurile, programul. Restaurantele cu site bine făcut apar mai bine și în hartă.",
      },
      {
        q: "Pot schimba singur meniul zilei?",
        a: "Da, și e făcut special ca să dureze două minute, de pe telefon.",
      },
      {
        q: "Rezervările se confirmă automat?",
        a: "Implicit, cererea îți ajunge ție și confirmi tu — la restaurante, o masă bună depinde de cum aranjezi sala, nu de un algoritm. Dacă vrei confirmare automată, se poate face.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Business acoperă un restaurant cu meniu, rezervări, galerie și pagină de evenimente. Starter, dacă vrei doar prezentare și contact.",
      },
    ],
    recommended: "business",
    related: ["fast-food", "shaormerie", "pensiuni-turistice"],
  },
  {
    slug: "pensiuni-turistice",
    category: "HoReCa",
    label: "Pensiuni și cazare",
    name: "o pensiune",
    h1: "Creare site pentru pensiuni și cazare",
    title: "Creare site pentru pensiuni | Rezervări fără comision",
    description:
      "Site pentru pensiunea ta: camere, tarife pe sezon, rezervare directă fără comision, facilități, împrejurimi și politici de cazare. Vezi ce include.",
    lead:
      "Booking îți aduce clienți și îți ia între 15 și 18 la sută din fiecare rezervare. Un site propriu nu înlocuiește platformele, dar îți aduce înapoi clienții care te-au găsit acolo o dată și te caută pe nume a doua oară — cu rezervare directă, fără comision.",
    problems: [
      {
        title: "Comisionul platformelor",
        body: "La o pensiune cu încasări decente, 16% înseamnă cât salariul unui om. Clientul care revine a doua oară, direct pe site, e profit curat.",
      },
      {
        title: "Nu se vede ce e în jur",
        body: "Oamenii nu rezervă o cameră, rezervă un weekend. Traseele, cascada, pârtia, cramele și restaurantele din zonă sunt jumătate din decizie, și lipsesc de pe aproape toate site-urile de pensiuni.",
      },
      {
        title: "Politicile aflate târziu strică vacanța",
        body: "Ora de check-in, dacă se acceptă animale, dacă se poate găti, ce se întâmplă cu avansul la anulare. Nescrise, devin conflicte la sosire.",
      },
    ],
    mustHave: [
      {
        title: "Camerele, fiecare cu pagina ei",
        body: "Fotografii reale, suprafață, tip de pat, capacitate, facilități, tarif. Fiecare tip de cameră e o decizie separată pentru client.",
      },
      {
        title: "Tarife pe sezon",
        body: "Extrasezon, sezon, sărbători, weekend prelungit, minim de nopți. Tabel clar, cu toate cazurile, inclusiv tariful pentru pat suplimentar și copii.",
      },
      {
        title: "Rezervare directă",
        body: "Formular cu perioada, tipul camerei și numărul de persoane. Cu avans online, dacă vrei să blochezi perioada în mod serios.",
      },
      {
        title: "Ce e de făcut în zonă",
        body: "Trasee, obiective, distanțe reale în kilometri și minute. E conținutul care aduce trafic din Google de la oameni care caută destinația, nu pensiunea.",
      },
      {
        title: "Facilități și mese",
        body: "Mic dejun inclusiv sau nu, bucătărie comună, ciubăr, grătar, loc de joacă, parcare, wi-fi. Lista pe care o compară toată lumea.",
      },
      {
        title: "Politici de cazare",
        body: "Check-in, check-out, animale, fumat, avans, condiții de anulare, vouchere de vacanță. Scrise o dată, la vedere.",
      },
    ],
    extras: [
      "Acceptare de vouchere de vacanță, menționată explicit",
      "Pachete pentru sărbători și evenimente",
      "Galerie pe anotimpuri",
      "Recenzii aduse din platforme",
    ],
    faq: [
      {
        q: "Site-ul se poate sincroniza cu Booking, ca să nu am suprarezervări?",
        a: "Se poate, printr-un serviciu de tip channel manager, care ține calendarele aliniate. E un abonament lunar separat, pe care îl plătești către furnizorul acela — îți spunem care sunt variantele și facem integrarea.",
      },
      {
        q: "Merită să dau pe site un preț mai mic decât pe Booking?",
        a: "Da, și e practica obișnuită: ce economisești din comision poți împărți cu clientul. Verifică însă contractul cu platforma — unele au clauze de paritate de preț.",
      },
      {
        q: "Accept vouchere de vacanță. E important să scriu asta?",
        a: "Foarte. E o căutare în sine, iar pentru mulți români e criteriul care decide. Merită scris pe prima pagină, nu ascuns în politici.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Business acoperă o pensiune cu camere, tarife, rezervare și pagini despre zonă. Pro, dacă adaugi plata avansului online și sincronizarea cu platformele.",
      },
    ],
    recommended: "business",
    related: ["restaurante", "balti-de-pescuit", "sali-de-fitness"],
  },

  // -------------------------------------------------------------------------
  // COMERȚ
  // -------------------------------------------------------------------------
  {
    slug: "magazine-online",
    category: "Comerț",
    label: "Magazine online",
    name: "un magazin online",
    h1: "Creare magazin online",
    title: "Creare magazin online | Catalog, plăți, curieri, ANPC",
    description:
      "Magazin online complet: catalog cu filtre, coș și checkout, plată cu cardul, integrare cu curierii, facturare și obligațiile legale ANPC și GDPR.",
    lead:
      "Un magazin online nu e un site cu produse. E un mecanism cu plăți, stoc, curieri, facturi și obligații legale, iar fiecare dintre ele poate să-l oprească din funcționat. Diferența dintre un magazin care vinde și unul care doar există stă aproape întotdeauna în checkout și în transport, nu în design.",
    problems: [
      {
        title: "Checkout-ul lung pierde coșuri",
        body: "Fiecare câmp în plus, fiecare cont obligatoriu, fiecare pas suplimentar înseamnă coșuri abandonate. Un checkout scurt, care merge și fără cont, e cea mai ieftină creștere de vânzări.",
      },
      {
        title: "Costul de transport apare prea târziu",
        body: "Clientul care descoperă taxa de livrare abia la ultimul pas pleacă. Afișată devreme, chiar și mare, nu supără pe nimeni.",
      },
      {
        title: "Obligațiile legale nu sunt opționale",
        body: "Retur în 14 zile, informarea consumatorului, butoanele ANPC, GDPR, politica de livrare. Un magazin fără ele riscă amenzi — și sunt exact lucrurile pe care nimeni nu le pune la loc după lansare.",
      },
    ],
    mustHave: [
      {
        title: "Catalog cu filtre reale",
        body: "Categorii, filtre pe caracteristicile care contează în domeniul tău, căutare care găsește și cu diacritice greșite. Un catalog prin care nu se poate naviga nu vinde, oricâte produse ar avea.",
      },
      {
        title: "Pagină de produs care vinde",
        body: "Fotografii multiple, descriere pe înțeles, specificații, stoc, termen de livrare, recenzii. Plus produse similare — de acolo vine o parte din coșul mediu.",
      },
      {
        title: "Coș și checkout scurt",
        body: "Fără cont obligatoriu, cu costul de transport calculat din timp și cu toate metodele de plată la vedere.",
      },
      {
        title: "Plăți și curieri",
        body: "Card prin procesator, ramburs dacă vrei, și integrare cu curierii — AWB generat automat, cu urmărirea coletului trimisă clientului.",
      },
      {
        title: "Administrare și stoc",
        body: "Adaugi produse, modifici prețuri, vezi comenzile, marchezi ce s-a livrat. Fără să ne suni. Cu export pentru contabilitate.",
      },
      {
        title: "Paginile obligatorii",
        body: "Termeni, retur în 14 zile, politica de livrare, confidențialitate, cookie-uri, butoanele ANPC SAL și SOL. Scrise, nu bifate.",
      },
    ],
    extras: [
      "Facturare automată și legătură cu programul de contabilitate",
      "Coduri de reducere și campanii",
      "Feed pentru Google Shopping și Meta",
      "Email de coș abandonat",
    ],
    faq: [
      {
        q: "Ce platformă folosiți?",
        a: "Alegem după ce vedem catalogul și volumul. Pentru majoritatea magazinelor din România, o platformă consacrată e alegerea corectă: costă mai puțin, are integrările cu curierii gata făcute și o poți administra fără noi. Construim de la zero doar când produsul chiar o cere.",
      },
      {
        q: "Cât costă plățile cu cardul?",
        a: "Procesatorul îți ia un comision pe tranzacție, care se negociază cu el, nu cu noi. Noi facem integrarea; contractul și comisionul rămân între tine și procesator.",
      },
      {
        q: "Am nevoie de firmă?",
        a: "Da. Un magazin online vinde în numele unei firme înregistrate, cu date de identificare afișate, facturi și obligații ANPC. Fără firmă nu se poate face legal.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Un magazin online e proiect de Pro sau Growth, în funcție de mărimea catalogului și de integrări. Îți dăm o ofertă după ce vedem câte produse ai și cu ce curieri lucrezi.",
      },
    ],
    recommended: "pro",
    related: ["fast-food", "detailing-auto", "service-auto"],
  },

  // -------------------------------------------------------------------------
  // SĂNĂTATE ȘI FRUMUSEȚE
  // -------------------------------------------------------------------------
  {
    slug: "cabinete-stomatologice",
    category: "Sănătate și frumusețe",
    label: "Cabinete stomatologice",
    name: "un cabinet stomatologic",
    h1: "Creare site pentru cabinete stomatologice",
    title: "Creare site pentru cabinete stomatologice | Programări online",
    description:
      "Site pentru cabinetul tău: servicii cu prețuri orientative, medicii, programare online, urgențe și tratarea corectă a datelor medicale sub GDPR.",
    lead:
      "La stomatologie, decizia se ia pe frică și pe încredere, nu pe preț. Omul caută un cabinet pentru că îl doare sau pentru că amână de doi ani. Site-ul are de făcut un singur lucru: să-l convingă că locul e serios și că poate suna azi.",
    problems: [
      {
        title: "Pacientul nu știe cât costă",
        body: "Teama de sumă ține oamenii departe de cabinet mai mult decât teama de durere. Un preț orientativ pe fiecare tratament, cu mențiunea că planul final se face după consultație, aduce pacienți care altfel nu ar fi sunat.",
      },
      {
        title: "Medicii nu apar nicăieri",
        body: "Un pacient alege un om, nu un cabinet. Fără pagina fiecărui medic, cu specializare și experiență, te compari doar la preț.",
      },
      {
        title: "Urgențele nu găsesc numărul",
        body: "O durere de dinte la nouă seara e cea mai motivată căutare care există. Dacă nu scrie limpede dacă preiei urgențe și în ce interval, pacientul sună în altă parte.",
      },
    ],
    mustHave: [
      {
        title: "Servicii, fiecare cu pagina lui",
        body: "Implant, ortodonție, estetică, endodonție, detartraj, protetică. Sunt căutări diferite, cu pacienți diferiți, și fiecare merită o pagină scrisă pe înțeles.",
      },
      {
        title: "Prețuri orientative",
        body: "Interval pe fiecare tratament, cu explicația de ce variază. Nu te obligă la nimic, dar elimină cel mai mare motiv de abandon.",
      },
      {
        title: "Echipa medicală",
        body: "Fiecare medic cu specializarea, formările și tipul de cazuri pe care le tratează. Cu fotografie reală, făcută în cabinet.",
      },
      {
        title: "Programare online",
        body: "Formular scurt: ce te doare sau ce tratament vrei, când poți veni, date de contact. Fără să ceri date medicale detaliate în formular — acelea se discută la cabinet.",
      },
      {
        title: "Urgențe",
        body: "Dacă preiei urgențe, în ce interval, la ce număr. Sus, la vedere, nu în subsol.",
      },
      {
        title: "Dotare și protocoale",
        body: "Aparatura, sterilizarea, materialele folosite. Pentru pacientul speriat, astea contează mai mult decât un slogan.",
      },
    ],
    extras: [
      "Plan de tratament în rate, dacă oferi",
      "Cazuri înainte și după, doar cu acordul scris al pacientului",
      "Contracte cu casa de asigurări, dacă e cazul",
      "Recenzii Google aduse pe site",
    ],
    faq: [
      {
        q: "Pot publica fotografii cu cazuri tratate?",
        a: "Da, dar numai cu acordul scris și explicit al pacientului pentru publicare, păstrat de tine. Sunt date medicale, categorie specială sub GDPR — regulile sunt mai stricte decât la orice alt domeniu. Îți lăsăm un model de acord.",
      },
      {
        q: "Formularul de programare e sigur pentru date medicale?",
        a: "Îl construim intenționat ca să nu ceară date medicale: doar cine ești, când poți veni și un motiv scurt. Datele medicale rămân la cabinet, unde le e locul.",
      },
      {
        q: "Merită pagini separate pentru fiecare tratament?",
        a: "Da. „Implant dentar preț” și „aparat dentar copii” sunt căutări diferite, cu zeci de mii de căutări pe lună în România. O pagină generală de servicii nu iese pe niciuna.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Un cabinet cu pagini pe tratamente, echipă și programare intră în Business. Pro, dacă ai mai multe locații sau adaugi programare cu calendar.",
      },
    ],
    recommended: "business",
    related: ["saloane-de-infrumusetare", "sali-de-fitness", "baze-de-inot"],
  },
  {
    slug: "saloane-de-infrumusetare",
    category: "Sănătate și frumusețe",
    label: "Saloane de înfrumusețare",
    name: "un salon de înfrumusețare",
    h1: "Creare site pentru saloane de înfrumusețare",
    title: "Creare site pentru saloane | Programări online și portofoliu",
    description:
      "Site pentru salonul tău: programare pe stilist, listă de servicii cu durată și preț, portofoliu de lucrări, carduri cadou și politica de anulare.",
    lead:
      "Un salon se alege după lucrările pe care le-ai făcut și după cât de ușor e să prinzi o oră. Instagramul rezolvă prima parte și pe a doua o strică: mesajele de programare se pierd între story-uri, iar orele libere rămân neocupate pentru că nimeni nu știe de ele.",
    problems: [
      {
        title: "Programările prin mesaje directe",
        body: "Zeci de conversații pe zi, în două aplicații, cu ore cerute de două persoane și confirmate greșit. Un formular sau un calendar de programări îți ia munca asta de pe cap.",
      },
      {
        title: "Anulările de ultim moment",
        body: "O oră anulată cu douăzeci de minute înainte e o oră pierdută. O politică de anulare scrisă și, dacă e cazul, un avans, schimbă complet comportamentul clienților.",
      },
      {
        title: "Prețul depinde de lungimea părului, deci lipsește",
        body: "Adevărat, dar „preț la cerere” peste tot îndepărtează clienta nouă. Un interval, cu explicația de ce variază, funcționează mult mai bine.",
      },
    ],
    mustHave: [
      {
        title: "Servicii cu durată și preț",
        body: "Fiecare serviciu cu durata și un interval de preț. Durata contează la fel de mult ca prețul — clienta își face programul în jurul ei.",
      },
      {
        title: "Programare pe stilist",
        body: "Multe cliente vin la o anumită persoană, nu la salon. Posibilitatea de a alege stilistul e un motiv serios de revenire.",
      },
      {
        title: "Portofoliu de lucrări",
        body: "Fotografii reale, ale salonului tău, grupate pe tip de lucrare. E dovada care aduce clienta nouă.",
      },
      {
        title: "Politica de anulare",
        body: "Cu cât timp înainte se poate anula, ce se întâmplă dacă nu se prezintă nimeni. Scrisă și afișată la programare, e acceptată fără discuții.",
      },
      {
        title: "Echipa",
        body: "Fiecare stilist cu specializarea și lucrările lui. Oamenii vin la oameni.",
      },
      {
        title: "Produse și tehnologii",
        body: "Cu ce mărci lucrezi și ce aparatură ai. Pentru tratamente și proceduri, e criteriul principal de alegere.",
      },
    ],
    extras: [
      "Carduri cadou, inclusiv cu plată online",
      "Pachete pentru mirese și evenimente",
      "Abonamente pentru proceduri în serie",
      "Recenzii Google aduse pe site",
    ],
    faq: [
      {
        q: "Am deja mulți clienți din Instagram. Îmi mai trebuie site?",
        a: "Instagramul aduce oameni care te urmăresc deja. Site-ul aduce femeia care a căutat „salon” plus numele cartierului și nu a auzit niciodată de tine. Și, spre deosebire de Instagram, site-ul e al tău — nu îl poți pierde peste noapte.",
      },
      {
        q: "Se pot face programări cu calendar real, nu doar formular?",
        a: "Da. Varianta cu calendar arată orele libere pe fiecare stilist și le blochează la rezervare. Costă mai mult decât un formular simplu, dar îți ia programările complet de pe cap.",
      },
      {
        q: "Pot cere avans la programare?",
        a: "Da, se poate adăuga plata cu cardul pentru avans — cea mai eficientă metodă împotriva neprezentărilor. Necesită un cont la un procesator de plăți pe firma ta.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Starter pentru un salon mic, cu servicii, portofoliu și formular. Business, dacă vrei programare pe stilist și pagini pe fiecare tip de serviciu.",
      },
    ],
    recommended: "starter",
    related: ["cabinete-stomatologice", "sali-de-fitness", "magazine-online"],
  },

  // -------------------------------------------------------------------------
  // CONSTRUCȚII
  // -------------------------------------------------------------------------
  {
    slug: "firme-de-constructii",
    category: "Construcții",
    label: "Firme de construcții",
    name: "o firmă de construcții",
    h1: "Creare site pentru firme de construcții",
    title: "Creare site pentru firme de construcții | Portofoliu lucrări",
    description:
      "Site pentru firma ta de construcții: portofoliu de lucrări cu etape, servicii, zona acoperită, cerere de ofertă cu plan atașat, autorizări și garanții.",
    lead:
      "Nimeni nu dă o casă pe mâna unei firme fără să-i vadă lucrările. Construcțiile se vând cu portofoliu — nu cu texte despre „profesionalism și seriozitate”, pe care le scrie oricine. Zece lucrări fotografiate onest, cu etape și durate reale, bat orice pagină de prezentare.",
    problems: [
      {
        title: "Portofoliul e într-un album de pe telefon",
        body: "Ai lucrările, dar nu le vede nimeni. Fotografiate de pe schelă, cu șantierul în desfășurare, sunt cel mai bun argument comercial pe care îl ai — și cel mai ignorat.",
      },
      {
        title: "Cererile de ofertă vin incomplete",
        body: "„Cât costă o casă?” nu are răspuns. Un formular care cere suprafața, regimul de înălțime, zona și planul atașat îți aduce cereri la care chiar poți răspunde cu o cifră.",
      },
      {
        title: "Nu se știe unde lucrezi",
        body: "O firmă din Cluj nu merge să ridice un gard în Constanța. Zona acoperită, scrisă limpede, elimină jumătate din telefoanele inutile.",
      },
    ],
    mustHave: [
      {
        title: "Portofoliu pe lucrări",
        body: "Fiecare lucrare cu tipul ei, suprafața, durata și fotografii de la început, din timpul execuției și la final. Etapele conving mai mult decât rezultatul singur.",
      },
      {
        title: "Servicii, separate",
        body: "Structuri, amenajări interioare, acoperișuri, izolații, fațade, împrejmuiri. Fiecare e o căutare diferită și merită pagina ei.",
      },
      {
        title: "Zona în care lucrezi",
        body: "Județele și distanța maximă până la șantier. Cu mențiunea dacă te deplasezi pentru lucrări mari.",
      },
      {
        title: "Cerere de ofertă serioasă",
        body: "Formular cu tipul lucrării, suprafața, stadiul actual, termenul dorit și posibilitatea de a atașa planul sau fotografii.",
      },
      {
        title: "Autorizări și garanții",
        body: "Ce autorizații ai, ce garanție dai la lucrare, cum se face recepția. Sunt lucrurile pe care beneficiarul serios le caută primul.",
      },
      {
        title: "Echipa și utilajele",
        body: "Câți oameni, ce utilaje proprii ai, ce subcontractezi. Onestitatea aici te separă de firmele care promit tot.",
      },
    ],
    extras: [
      "Pagini pe fiecare oraș din zona în care lucrezi",
      "Calculator orientativ de cost pe metru pătrat",
      "Pagină de angajări pentru meseriași",
      "Colaborări cu arhitecți și proiectanți",
    ],
    faq: [
      {
        q: "Nu am fotografii bune de la lucrări. Ce fac?",
        a: "Se poate recupera parțial: multe firme au poze făcute de muncitori pe șantier, care sunt mai convingătoare decât cele „de reclamă”. Pentru lucrările viitoare îți dăm o listă scurtă cu ce și când să fotografiezi.",
      },
      {
        q: "Pot pune prețuri pe metru pătrat?",
        a: "Poți pune intervale orientative, cu ce includ și ce nu. Ajută la filtrarea cererilor, dar trebuie formulate cu grijă — un preț înțeles greșit devine o discuție neplăcută la ofertare.",
      },
      {
        q: "Merită pagini pe fiecare oraș?",
        a: "Da, dacă lucrezi efectiv acolo și ai ce scrie despre fiecare: lucrări făcute în zonă, particularități locale. Pagini identice cu numele orașului schimbat sunt considerate spam de Google.",
      },
      {
        q: "Ce pachet mi se potrivește?",
        a: "Business acoperă o firmă cu portofoliu, pagini pe servicii și cerere de ofertă cu atașamente. Starter, dacă vrei o prezentare simplă și contact.",
      },
    ],
    recommended: "business",
    related: ["service-auto", "tractari-auto", "magazine-online"],
  },
];

export const nicheCategories: NicheCategory[] = [
  "Sport și agrement",
  "Auto",
  "HoReCa",
  "Comerț",
  "Sănătate și frumusețe",
  "Construcții",
];

export function getNiche(slug: string) {
  return niches.find((n) => n.slug === slug);
}

// Brand-new agency identity, established for this project — no real company
// name, contact details, portfolio clients, or stats were supplied, so
// nothing below is presented as verified fact. "CreareWebsitePro" is a
// placeholder name (swap `siteConfig.name` before go-live); pricing is an
// editable starting proposal, not a published price list; portfolio items
// are explicitly labeled demo/concept work, never real client results.

// ---------------------------------------------------------------------------
// PRICING — single source of truth. Change figures here only.
// ---------------------------------------------------------------------------
export const pricingPlans = [
  {
    id: "starter",
    name: "STARTER",
    price: "1.490 lei",
    priceNote: null as string | null,
    audience: "Pentru afaceri mici și persoane care au nevoie de o prezență online profesională.",
    featured: false,
    cta: "Alege Starter",
    features: [
      "Website până la 5 pagini",
      "Design responsive",
      "Formular de contact",
      "Integrare WhatsApp",
      "SEO de bază",
      "Optimizare viteză",
      "Configurare domeniu/hosting",
      "SSL",
      "1 rundă de modificări",
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    price: "2.990 lei",
    priceNote: null as string | null,
    audience: "Pentru firme care vor un website complet și pregătit pentru creștere.",
    featured: true,
    cta: "Alege Business",
    features: [
      "Website până la 10 pagini",
      "Design custom",
      "Animații premium",
      "SEO on-page",
      "Google Analytics / tracking",
      "Formulare avansate",
      "Integrare Google Maps",
      "Integrare social media",
      "Optimizare performanță",
      "3 runde de modificări",
      "Suport post-lansare",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    price: "4.990 lei",
    priceNote: null as string | null,
    audience: "Pentru companii care vor o prezență online premium.",
    featured: false,
    cta: "Alege Pro",
    features: [
      "Website custom, până la 20 pagini",
      "Animații avansate",
      "UX/UI custom",
      "SEO tehnic",
      "Strategie SEO inițială",
      "Tracking avansat",
      "Integrare CRM/API unde este cazul",
      "Optimizare conversii",
      "Performanță avansată",
      "Suport prioritar",
    ],
  },
  {
    id: "growth",
    name: "GROWTH",
    price: "7.990 lei",
    priceNote: "de la",
    audience: "Pentru companii care vor WEBSITE + SEO + MARKETING.",
    featured: false,
    cta: "Discută proiectul",
    features: [
      "Website premium",
      "Strategie SEO",
      "Optimizare SEO continuă",
      "Strategie marketing",
      "Setup tracking",
      "Campanii publicitare unde este cazul",
      "Optimizare conversii",
      "Mentenanță",
      "Raportare",
    ],
  },
] as const;

export const pricingDisclaimer =
  "Prețurile afișate sunt orientative. Oferta finală se stabilește în funcție de complexitatea proiectului și cerințele clientului.";

// ---------------------------------------------------------------------------
// SITE / BRAND
// ---------------------------------------------------------------------------
export const siteConfig = {
  name: "CreareWebsitePro",
  legalName: "CreareWebsitePro",
  tagline: "Construim site-uri care îți cresc afacerea.",
  description:
    "Website-uri la cheie, SEO și marketing digital — tot ce ai nevoie pentru o prezență online care contează. Partener RobixHost.ro.",
  // Search-facing copy is keyword-first; the brand name is what people find
  // us by last, not first. Kept separate from the on-page tagline so the
  // design copy and the SERP copy can differ without fighting each other.
  seoTitle: "Creare Website & Magazin Online în România | CreareWebsitePro",
  seoDescription:
    "Creăm site-uri de prezentare, magazine online și optimizare SEO. Design pe măsură, termene clare, pachete de la 1.490 lei. Cere o ofertă gratuită.",
  email: "robixhosting@gmail.com",
  // Afișat în format românesc; `phoneHref` e forma internațională, singura
  // pe care o acceptă tel: și schema.org fără ambiguitate de prefix.
  phone: "0773 938 355",
  phoneHref: "+40773938355",
  domain: "crearewebsitepro.ro",
  robixHostUrl: "https://robixhost.ro",
  locality: "România",
};

/**
 * Terms this site should actually be findable by, in the words Romanian
 * visitors type. Used for the keywords meta and, more usefully, as the
 * schema.org knowsAbout list.
 *
 * Ordered by how close each one sits to what this site actually sells —
 * the domain is built on "creare website", so that family leads.
 */
export const seoKeywords = [
  "creare website",
  "creare website profesional",
  "creare site web",
  "creare site de prezentare",
  "firma creare site-uri",
  "pret creare site web",
  "creare magazin online",
  "magazin online preturi",
  "web design România",
  "agentie web design",
  "optimizare SEO",
  "servicii SEO România",
  "agentie marketing digital",
  "promovare online",
  "website la cheie",
  "mentenanta website",
  "redesign site",
  "site responsive",
];

export const navLinks = [
  { label: "Servicii", href: "#servicii" },
  { label: "Pachete", href: "#pachete" },
  { label: "Portofoliu", href: "#portofoliu" },
  { label: "Proces", href: "#proces" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export const footerLinks = {
  services: [
    { label: "Website-uri la cheie", href: "#servicii" },
    { label: "Magazine online", href: "#servicii" },
    { label: "SEO", href: "#servicii" },
    { label: "Marketing digital", href: "#servicii" },
    { label: "Mentenanță", href: "#servicii" },
  ],
  nav: [
    { label: "Pachete", href: "#pachete" },
    { label: "Portofoliu", href: "#portofoliu" },
    { label: "Proces", href: "#proces" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Termeni și condiții", href: "/terms" },
    { label: "Confidențialitate (GDPR)", href: "/privacy" },
    { label: "Politica de cookie-uri", href: "/cookies" },
  ],
};

// ---------------------------------------------------------------------------
// DATE DE FIRMĂ
// ---------------------------------------------------------------------------
/**
 * ÎNLOCUIEȘTE ÎNAINTE DE LANSARE.
 *
 * Termenii, politica de confidențialitate și obligațiile ANPC cer datele
 * reale de identificare ale comerciantului. Nu le am, așa că sunt lăsate ca
 * marcaje evidente — și, cât timp `isPlaceholder` e `true`, paginile legale
 * afișează un avertisment vizibil, ca să nu ajungă online arătând oficial
 * fără să fie. Pune datele reale și treci `isPlaceholder` pe `false`.
 */
export const companyDetails = {
  isPlaceholder: true,
  legalName: "[Denumire firmă] S.R.L.",
  cui: "[CUI/CIF]",
  regCom: "[Nr. Registrul Comerțului]",
  address: "[Adresa sediului social]",
  bank: "[Banca]",
  iban: "[IBAN]",
};

/**
 * Metodele de plată acceptate, confirmate de client. Numerarul și ramburs-ul
 * lipsesc intenționat — nu sunt acceptate.
 */
export const paymentMethods = [
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "transfer", label: "Transfer bancar" },
  { id: "paypal", label: "PayPal" },
  { id: "crypto", label: "Criptomonede" },
] as const;

// ---------------------------------------------------------------------------
// SERVICES
// ---------------------------------------------------------------------------
export type Service = {
  index: string;
  name: string;
  summary: string;
  points: string[];
};

export const services: Service[] = [
  {
    index: "01",
    name: "Website-uri la cheie",
    summary: "Design custom, dezvoltare și lansare completă, de la zero până la domeniul tău live.",
    points: [
      "Design custom",
      "Dezvoltare",
      "Responsive",
      "Optimizare",
      "Formulare",
      "Integrare servicii",
      "Configurare domeniu/hosting",
      "Lansare",
    ],
  },
  {
    index: "02",
    name: "Magazine online",
    summary: "Catalog, coș și plăți — un magazin gata să vândă, optimizat pentru conversii și SEO.",
    points: [
      "Catalog produse",
      "Coș de cumpărături",
      "Checkout",
      "Plăți",
      "Administrare produse",
      "Responsive",
      "SEO-ready",
    ],
  },
  {
    index: "03",
    name: "SEO",
    summary: "Audit tehnic, optimizare on-page și o strategie de conținut construită pe cuvinte cheie reale.",
    points: [
      "Audit SEO",
      "Optimizare tehnică",
      "Optimizare on-page",
      "Research cuvinte cheie",
      "Content strategy",
      "Monitorizare",
    ],
  },
  {
    index: "04",
    name: "Marketing digital",
    summary: "Strategie, campanii și tracking — creștere măsurabilă, nu doar prezență online.",
    points: [
      "Strategie",
      "Campanii",
      "Social media",
      "Google Ads / Meta Ads, dacă sunt oferite",
      "Tracking",
      "Optimizare conversii",
    ],
  },
  {
    index: "05",
    name: "Mentenanță",
    summary: "Website-ul rămâne actualizat, sigur și funcțional mult după lansare.",
    points: ["Actualizări", "Backup", "Securitate", "Monitorizare", "Modificări"],
  },
];

// ---------------------------------------------------------------------------
// COMPARISON TABLE
// ---------------------------------------------------------------------------
export type ComparisonRow = {
  label: string;
  values: [string | boolean, string | boolean, string | boolean, string | boolean];
};

export const comparisonRows: ComparisonRow[] = [
  { label: "Website", values: [true, true, true, true] },
  { label: "Pagini", values: ["5", "10", "20", "Custom"] },
  { label: "Responsive", values: [true, true, true, true] },
  { label: "SEO", values: ["De bază", "On-page", "Tehnic", "Strategie completă"] },
  { label: "Analytics", values: [false, true, true, true] },
  { label: "Animații", values: ["—", "Premium", "Avansate", "Avansate"] },
  { label: "Mentenanță", values: [false, "Post-lansare", "Prioritar", true] },
  { label: "Marketing", values: [false, false, false, true] },
  { label: "Suport", values: ["1 rundă", "3 runde", "Prioritar", "Continuu"] },
];

// ---------------------------------------------------------------------------
// PROCESS
// ---------------------------------------------------------------------------
export const processSteps = [
  { index: "01", title: "Discutăm ideea", description: "Înțelegem afacerea, obiectivele și ce vrei să obții cu website-ul." },
  { index: "02", title: "Construim strategia", description: "Definim structura, funcționalitățile și direcția vizuală potrivite." },
  { index: "03", title: "Design & Development", description: "Construim website-ul, secțiune cu secțiune, cu cod curat și atenție la detalii." },
  { index: "04", title: "Testare & Optimizare", description: "Verificăm pe toate device-urile, corectăm și optimizăm performanța." },
  { index: "05", title: "Lansare", description: "Publicăm website-ul, configurăm domeniul și mergem live." },
  { index: "06", title: "Creștere", description: "SEO, mentenanță și optimizări continue, după lansare." },
] as const;

// ---------------------------------------------------------------------------
// PORTFOLIO — explicitly demo/concept work, not real client results.
// ---------------------------------------------------------------------------
export const portfolioItems = [
  {
    id: "restaurant",
    href: "/demo/restaurant",
    preview: "/previews/restaurant.webp",
    previewPosition: "50% 0%",
    category: "Website restaurant",
    title: "Concept — restaurant premium",
    description: "Meniu, galerie și rezervare online, gândite pentru o experiență de fine dining.",
  },
  {
    id: "fitness",
    href: "/demo/fitness",
    preview: "/previews/fitness.webp",
    previewPosition: "0% 0%",
    category: "Website fitness & sală",
    title: "Concept — sală de fitness",
    description: "Abonamente, antrenori și program clar — construit să convertească vizitatori în membri.",
  },
  {
    id: "shop",
    href: "/demo/shop",
    preview: "/previews/shop.webp",
    previewPosition: "0% 0%",
    category: "Magazin online",
    title: "Concept — brand de produse",
    description: "Catalog, filtre, coș funcțional și checkout demo, gândite mobile-first.",
  },
  {
    id: "agency",
    href: "/demo/agency",
    preview: "/previews/agency.webp",
    previewPosition: "0% 0%",
    category: "Portofoliu agenție creativă",
    title: "Concept — agenție creativă",
    description: "Studii de caz, proiecte și tranziții cinematice pentru un portofoliu editorial.",
  },
] as const;

// ---------------------------------------------------------------------------
// WHY US
// ---------------------------------------------------------------------------
export const whyUs = [
  { title: "Design modern", description: "Fiecare proiect pornește de la brandul tău, nu de la un șablon reciclat." },
  { title: "Cod curat", description: "Arhitectură clară, ușor de întreținut și de extins pe termen lung." },
  { title: "Responsive", description: "Gândit separat pentru mobil, nu doar un desktop micșorat." },
  { title: "SEO-ready", description: "Structură tehnică pregătită din prima zi să fie găsită de Google." },
  { title: "Performanță", description: "Viteză de încărcare optimizată — Core Web Vitals ca prioritate, nu ca ultim pas." },
  { title: "Suport", description: "Rămânem alături de tine și după lansare, nu doar până la livrare." },
] as const;

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export const faqItems = [
  { question: "Cât durează realizarea unui website?", answer: "Depinde de complexitate — un website Starter poate fi gata în câteva săptămâni, un proiect Pro/Growth durează mai mult. Stabilim un termen clar încă din prima discuție." },
  { question: "Ce este inclus în preț?", answer: "Fiecare pachet are un set clar de livrabile, afișat mai sus. Orice cerință în plus față de pachetul ales se discută și se cotează transparent înainte de start." },
  { question: "Oferiți hosting?", answer: "Da, prin RobixHost.ro — partenerul nostru de hosting. Ne ocupăm de configurare, tu primești acces complet la cont." },
  { question: "Oferiți SEO?", answer: "Da — de la optimizare de bază inclusă în pachetele mai mici, până la strategie SEO completă în pachetul Growth." },
  { question: "Pot modifica ulterior website-ul?", answer: "Da. Fiecare pachet include runde de modificări incluse, iar ulterior poți solicita oricând intervenții sau poți opta pentru un abonament de mentenanță." },
  { question: "Website-ul funcționează pe telefon?", answer: "Da — fiecare website este construit responsive și testat separat pe mobil, nu doar redimensionat de pe desktop." },
  { question: "Se poate face magazin online?", answer: "Da, este exact ce acoperă pachetul de Magazine online: catalog, coș, checkout și plăți." },
  { question: "Pot cere funcționalități personalizate?", answer: "Da. Integrările custom (CRM, API-uri, funcționalități specifice) se discută punctual și se includ în ofertă." },
  { question: "Oferiți mentenanță?", answer: "Da — actualizări, backup, securitate și monitorizare, ca serviciu separat sau inclus în pachetele Business/Pro/Growth." },
  { question: "Cum începem proiectul?", answer: "Completezi formularul de contact de mai jos sau ne scrii direct — stabilim o discuție scurtă și pornim de la acolo." },
] as const;

// ---------------------------------------------------------------------------
// CONTACT FORM
// ---------------------------------------------------------------------------
export const projectTypeOptions = [
  "Website",
  "Magazin online",
  "SEO",
  "Marketing",
  "Website + SEO",
  "Website + Marketing",
  "Pachet complet",
  "Altceva",
];

export const budgetOptions = [
  "sub 1.500 lei",
  "1.500 – 3.000 lei",
  "3.000 – 5.000 lei",
  "5.000 – 10.000 lei",
  "10.000+ lei",
];

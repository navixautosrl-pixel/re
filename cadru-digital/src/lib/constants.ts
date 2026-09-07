// Brand-new agency identity, established for this project (no pre-existing
// company to misrepresent). Contact email follows the brand domain and
// needs to be activated before go-live; no phone number is shown since we
// have no real line to publish. Portfolio entries are explicitly labeled
// demo/placeholder work, not fabricated client results — see Portfolio.tsx.

export const siteConfig = {
  name: "Cadru Digital",
  legalName: "Cadru Digital",
  tagline: "Website-uri care transformă atenția în rezultate.",
  description:
    "Agenție digitală premium din România — creăm website-uri, magazine online și landing page-uri rapide, optimizate SEO și construite pentru conversii.",
  email: "contact@cadrudigital.ro",
  domain: "cadrudigital.ro",
  robixHostUrl: "https://robixhost.ro",
  locality: "România",
};

export const navLinks = [
  { label: "Servicii", href: "#servicii" },
  { label: "Portofoliu", href: "#portofoliu" },
  { label: "Proces", href: "#proces" },
  { label: "Despre noi", href: "#despre" },
  { label: "Contact", href: "#contact" },
];

export type Service = {
  index: string;
  name: string;
  summary: string;
  description: string;
  benefits: string[];
};

export const services: Service[] = [
  {
    index: "01",
    name: "Website-uri",
    summary: "Site-uri de prezentare construite pentru afacerea ta, nu dintr-un șablon.",
    description:
      "Construim experiențe digitale personalizate, rapide și optimizate pentru conversii — de la structură și conținut, până la fiecare detaliu de interacțiune.",
    benefits: ["Design personalizat", "Responsive", "Performanță", "SEO tehnic", "UX/UI", "Conversii"],
  },
  {
    index: "02",
    name: "Landing Page",
    summary: "Pagini dedicate unei singure oferte, construite să convertească.",
    description:
      "O pagină de destinație are un singur job. O construim în jurul acelui job — mesaj clar, un singur drum către acțiune, fără distrageri.",
    benefits: ["O singură ofertă", "Mesaj clar", "Formular optimizat", "Testare A/B posibilă", "Încărcare rapidă"],
  },
  {
    index: "03",
    name: "Magazine Online",
    summary: "Structuri de e-commerce clare, rapide și pregătite pentru scalare.",
    description:
      "De la catalog și fișe de produs până la checkout — construim magazine online în care fiecare pas către plată este cât mai simplu posibil.",
    benefits: ["Catalog structurat", "Checkout simplu", "SEO produse", "Performanță mobilă", "Scalabil"],
  },
  {
    index: "04",
    name: "SEO",
    summary: "Fundația tehnică și de conținut care te face găsit pe Google.",
    description:
      "SEO tehnic, structură semantică, cercetare de cuvinte cheie și optimizare on-page — vizibilitate construită de la bază, nu adăugată ulterior.",
    benefits: ["SEO tehnic", "Cercetare cuvinte cheie", "Optimizare on-page", "SEO local", "Monitorizare"],
  },
  {
    index: "05",
    name: "Marketing Digital",
    summary: "Strategie și campanii care aduc oamenii potriviți către site.",
    description:
      "Te ajutăm să atragi audiența potrivită, să generezi lead-uri calificate și să înțelegi ce funcționează, ca să scalezi exact acele acțiuni.",
    benefits: ["Strategie", "Reclame", "Generare lead-uri", "Remarketing", "Analiză & CRO"],
  },
  {
    index: "06",
    name: "Optimizare & Mentenanță",
    summary: "Site-ul rămâne rapid, sigur și actualizat după lansare.",
    description:
      "Un website bun continuă să fie întreținut — actualizări, monitorizare de performanță și ajustări bazate pe date reale de utilizare.",
    benefits: ["Actualizări", "Monitorizare performanță", "Backup & securitate", "Suport continuu"],
  },
];

export const processSteps = [
  {
    index: "01",
    name: "Descoperire",
    description: "Înțelegem afacerea, obiectivele și publicul țintă înainte să desenăm orice.",
  },
  {
    index: "02",
    name: "Strategie",
    description: "Definim structura, mesajele cheie și traseul pe care îl va urma vizitatorul.",
  },
  {
    index: "03",
    name: "Design",
    description: "Construim un sistem vizual dedicat brandului tău, nu un șablon adaptat.",
  },
  {
    index: "04",
    name: "Dezvoltare",
    description: "Implementăm cu tehnologie modernă, cod curat și performanță ca prioritate.",
  },
  {
    index: "05",
    name: "Lansare",
    description: "Testăm, optimizăm și lansăm — cu SEO tehnic pus la punct de la prima zi.",
  },
  {
    index: "06",
    name: "Creștere",
    description: "Monitorizăm, optimizăm și ajustăm pe baza datelor reale de utilizare.",
  },
];

export const whyUs = [
  {
    name: "Design personalizat",
    description: "Fiecare proiect pornește de la brandul tău, nu dintr-un șablon reutilizat.",
  },
  {
    name: "Performanță",
    description: "Cod curat, imagini optimizate și arhitectură modernă — site-uri care se încarcă rapid.",
  },
  {
    name: "SEO-ready",
    description: "Structură semantică și fundație tehnică corectă, gândite de la prima linie de cod.",
  },
  {
    name: "Mobile-first",
    description: "Proiectăm întâi pentru mobil, unde vine majoritatea traficului real.",
  },
  {
    name: "UX/UI atent",
    description: "Fiecare interacțiune este gândită să reducă friscțiunea și să ghideze spre acțiune.",
  },
  {
    name: "Tehnologie modernă",
    description: "Stack actual, mentenabil pe termen lung — nu soluții improvizate.",
  },
  {
    name: "Orientare spre conversii",
    description: "Site-ul este construit ca instrument de vânzare, nu doar ca vitrină.",
  },
  {
    name: "Suport pe termen lung",
    description: "Rămânem alături de proiect după lansare — actualizări, mentenanță, optimizare.",
  },
];

export const faqItems = [
  {
    question: "Cât durează realizarea unui website?",
    answer:
      "Depinde de complexitate — un site de prezentare durează de regulă câteva săptămâni, un magazin online mai mult. Stabilim un termen clar încă din etapa de strategie.",
  },
  {
    question: "Pot modifica website-ul după lansare?",
    answer:
      "Da. Construim site-uri ușor de actualizat și oferim și opțiunea de mentenanță continuă, dacă preferi să ne ocupăm noi de modificări.",
  },
  {
    question: "Website-ul este optimizat pentru Google?",
    answer:
      "Da — SEO tehnic, structură semantică și performanță sunt parte din procesul de dezvoltare, nu un serviciu adăugat ulterior.",
  },
  {
    question: "Este website-ul responsive?",
    answer: "Da, fiecare site este proiectat mobile-first și testat pe toate dimensiunile reale de ecran.",
  },
  {
    question: "Pot avea și hosting?",
    answer:
      "Da — suntem parteneri RobixHost și putem recomanda și configura găzduirea potrivită pentru proiectul tău.",
  },
  {
    question: "Oferiți mentenanță?",
    answer: "Da, ca serviciu separat — actualizări, monitorizare de performanță și suport continuu.",
  },
  {
    question: "Ce se întâmplă după lansare?",
    answer:
      "Monitorizăm performanța reală a site-ului și venim cu recomandări de optimizare pe baza datelor de utilizare, nu a presupunerilor.",
  },
];

export type BudgetOption = { value: string; label: string };

export const budgetOptions: BudgetOption[] = [
  { value: "sub-1000", label: "Sub 1.000 €" },
  { value: "1000-2500", label: "1.000 € – 2.500 €" },
  { value: "2500-5000", label: "2.500 € – 5.000 €" },
  { value: "5000-10000", label: "5.000 € – 10.000 €" },
  { value: "peste-10000", label: "Peste 10.000 €" },
  { value: "nu-stiu", label: "Nu știu încă" },
];

export const serviceOptions = [
  { value: "website", label: "Website de prezentare" },
  { value: "landing", label: "Landing Page" },
  { value: "ecommerce", label: "Magazin online" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Marketing digital" },
  { value: "mentenanta", label: "Optimizare & mentenanță" },
  { value: "altceva", label: "Altceva" },
];

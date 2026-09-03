// Central content/config for the RobixHost site.
//
// Pricing and plan specifications below are real product/business
// decisions the site owner has authorized directly (see conversation) —
// not fabricated third-party facts. What stays a marked placeholder is
// anything this site cannot responsibly assert on its own: historical
// uptime, physical datacenter locations, hardware brand specifics,
// client testimonials/counts, and legal/registration data.

export const siteConfig = {
  name: "ROBIXHOST",
  domain: "robixhost.ro",
  url: "https://robixhost.ro",
  tagline: "Infrastructure built for performance.",
  description:
    "Web hosting, VPS, servere dedicate, game servers și domenii pe infrastructură NVMe cu protecție DDoS — plus creare website-uri, digital marketing și SEO. Pentru afaceri din România.",
  supportEmail: "support@robixhost.ro",
  salesEmail: "sales@robixhost.ro",
  // WHMCS client area — all ordering/billing/support tickets happen here.
  // This marketing site has no backend or cart of its own by design.
  clientAreaUrl: "https://clienti.robixhost.ro",
};

// The exact WHMCS product IDs aren't known from here — swap these for
// real https://clienti.robixhost.ro/cart.php?a=add&pid=<id> links once
// products are configured in WHMCS. Until then every "Comandă" CTA opens
// the client area itself.
export const orderUrl = siteConfig.clientAreaUrl;

export const legalConfig = {
  companyLegalName: "TODO — denumirea legală completă a societății (ex: S.C. ROBIXHOST S.R.L.)",
  registrationNumber: "TODO — Nr. Registrul Comerțului (J.../.../....)",
  fiscalCode: "TODO — CUI/CIF",
  registeredAddress: "TODO — sediul social complet",
  contactAddress: "TODO — adresă de corespondență, dacă diferă",
  anpcNote:
    "TODO — verificați obligațiile de afișare ANPC (link SOL, link ANPC) aplicabile activității companiei",
};

// ── Navigation ──────────────────────────────────────────────────────────

export type NavItem = { label: string; href: string; description: string };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Produse",
    items: [
      { label: "Web Hosting", href: "/hosting", description: "Găzduire rapidă pe NVMe, cu DDoS inclus" },
      { label: "VPS", href: "/vps", description: "Resurse dedicate, acces root complet" },
      { label: "Dedicated Servers", href: "/dedicated-servers", description: "Hardware exclusiv, control total" },
      { label: "Game Servers", href: "/game-servers", description: "Infrastructură pentru comunități de gaming" },
      { label: "Domenii", href: "/domains", description: "Înregistrare și DNS administrat" },
    ],
  },
  {
    label: "Soluții",
    items: [
      { label: "Creare Website-uri", href: "/web-design", description: "Site-uri la cheie, livrate rapid" },
      { label: "Digital Marketing", href: "/digital-marketing", description: "Campanii Meta & Google Ads" },
      { label: "SEO", href: "/seo", description: "Poziționare organică pe termen lung" },
    ],
  },
];

export const navSingleLinks: NavItem[] = [
  { label: "Infrastructură", href: "/#infrastructure", description: "" },
  { label: "Companie", href: "/about", description: "" },
  { label: "Suport", href: "/support", description: "" },
];

export const footerLinks = {
  products: [
    { label: "Web Hosting", href: "/hosting" },
    { label: "VPS", href: "/vps" },
    { label: "Dedicated Servers", href: "/dedicated-servers" },
    { label: "Game Servers", href: "/game-servers" },
    { label: "Domenii", href: "/domains" },
    { label: "Prețuri", href: "/pricing" },
  ],
  solutions: [
    { label: "Creare Website-uri", href: "/web-design" },
    { label: "Digital Marketing", href: "/digital-marketing" },
    { label: "SEO", href: "/seo" },
  ],
  company: [
    { label: "Despre noi", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Status infrastructură", href: "/status" },
    { label: "Suport", href: "/support" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Termeni și condiții", href: "/terms" },
    { label: "Politica de confidențialitate", href: "/privacy" },
    { label: "Politica cookie", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
    { label: "Politica de rambursare", href: "/refund-policy" },
    { label: "Politica de utilizare acceptabilă", href: "/acceptable-use" },
    { label: "SLA", href: "/sla" },
  ],
};

// ── Pricing ─────────────────────────────────────────────────────────────

export type PlanFeature = { label: string; value: string };

export type HostingPlan = {
  name: string;
  tier: "Starter" | "Pro" | "Business";
  featured?: boolean;
  monthlyRon: number;
  features: PlanFeature[];
};

/** Annual billing price, rounded to the leu — a 15% discount vs. monthly. */
export function annualMonthlyEquivalent(monthlyRon: number): number {
  return Math.round(monthlyRon * 0.85);
}

export const hostingPlans: HostingPlan[] = [
  {
    name: "Starter",
    tier: "Starter",
    monthlyRon: 24,
    features: [
      { label: "Website-uri", value: "1" },
      { label: "Stocare NVMe", value: "15 GB" },
      { label: "Trafic lunar", value: "Nelimitat" },
      { label: "Baze de date", value: "1" },
      { label: "Certificat SSL", value: "Inclus" },
      { label: "Backup automat", value: "Săptămânal" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Email & tichet" },
    ],
  },
  {
    name: "Pro",
    tier: "Pro",
    featured: true,
    monthlyRon: 39,
    features: [
      { label: "Website-uri", value: "5" },
      { label: "Stocare NVMe", value: "50 GB" },
      { label: "Trafic lunar", value: "Nelimitat" },
      { label: "Baze de date", value: "10" },
      { label: "Certificat SSL", value: "Inclus" },
      { label: "Backup automat", value: "Zilnic" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate" },
    ],
  },
  {
    name: "Business",
    tier: "Business",
    monthlyRon: 69,
    features: [
      { label: "Website-uri", value: "Nelimitate" },
      { label: "Stocare NVMe", value: "150 GB" },
      { label: "Trafic lunar", value: "Nelimitat" },
      { label: "Baze de date", value: "Nelimitate" },
      { label: "Certificat SSL", value: "Inclus" },
      { label: "Backup automat", value: "Zilnic, retenție 30 zile" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate maximă" },
    ],
  },
];

export const vpsPlans: HostingPlan[] = [
  {
    name: "Starter",
    tier: "Starter",
    monthlyRon: 59,
    features: [
      { label: "vCPU", value: "2 nuclee" },
      { label: "RAM", value: "4 GB" },
      { label: "Stocare NVMe", value: "60 GB" },
      { label: "Trafic lunar", value: "4 TB" },
      { label: "Acces root", value: "Complet" },
      { label: "Backup automat", value: "Săptămânal" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Email & tichet" },
    ],
  },
  {
    name: "Pro",
    tier: "Pro",
    featured: true,
    monthlyRon: 129,
    features: [
      { label: "vCPU", value: "4 nuclee" },
      { label: "RAM", value: "8 GB" },
      { label: "Stocare NVMe", value: "120 GB" },
      { label: "Trafic lunar", value: "8 TB" },
      { label: "Acces root", value: "Complet" },
      { label: "Backup automat", value: "Zilnic" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate" },
    ],
  },
  {
    name: "Business",
    tier: "Business",
    monthlyRon: 249,
    features: [
      { label: "vCPU", value: "8 nuclee" },
      { label: "RAM", value: "16 GB" },
      { label: "Stocare NVMe", value: "240 GB" },
      { label: "Trafic lunar", value: "16 TB" },
      { label: "Acces root", value: "Complet" },
      { label: "Backup automat", value: "Zilnic, retenție 30 zile" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate maximă" },
    ],
  },
];

export const gameServerPlans: HostingPlan[] = [
  {
    name: "Starter",
    tier: "Starter",
    monthlyRon: 29,
    features: [
      { label: "RAM", value: "2 GB" },
      { label: "Sloturi jucători", value: "Nelimitate" },
      { label: "Stocare NVMe", value: "Inclusă" },
      { label: "Panou de administrare", value: "Inclus" },
      { label: "Backup automat", value: "Săptămânal" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Email & tichet" },
    ],
  },
  {
    name: "Pro",
    tier: "Pro",
    featured: true,
    monthlyRon: 55,
    features: [
      { label: "RAM", value: "4 GB" },
      { label: "Sloturi jucători", value: "Nelimitate" },
      { label: "Stocare NVMe", value: "Inclusă" },
      { label: "Panou de administrare", value: "Inclus" },
      { label: "Backup automat", value: "Zilnic" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate" },
    ],
  },
  {
    name: "Business",
    tier: "Business",
    monthlyRon: 99,
    features: [
      { label: "RAM", value: "8 GB" },
      { label: "Sloturi jucători", value: "Nelimitate" },
      { label: "Stocare NVMe", value: "Inclusă" },
      { label: "Panou de administrare", value: "Inclus" },
      { label: "Backup automat", value: "Zilnic, retenție 30 zile" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate maximă" },
    ],
  },
];

export const dedicatedServerPlans: HostingPlan[] = [
  {
    name: "Starter",
    tier: "Starter",
    monthlyRon: 449,
    features: [
      { label: "CPU", value: "Quad-core" },
      { label: "RAM", value: "32 GB" },
      { label: "Stocare", value: "2× 480 GB SSD RAID1" },
      { label: "Trafic lunar", value: "20 TB" },
      { label: "Acces root/IPMI", value: "Complet" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate" },
    ],
  },
  {
    name: "Pro",
    tier: "Pro",
    featured: true,
    monthlyRon: 799,
    features: [
      { label: "CPU", value: "8 nuclee" },
      { label: "RAM", value: "64 GB" },
      { label: "Stocare", value: "2× 960 GB SSD RAID1" },
      { label: "Trafic lunar", value: "30 TB" },
      { label: "Acces root/IPMI", value: "Complet" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate maximă" },
    ],
  },
  {
    name: "Business",
    tier: "Business",
    monthlyRon: 1399,
    features: [
      { label: "CPU", value: "16 nuclee" },
      { label: "RAM", value: "128 GB" },
      { label: "Stocare", value: "2× 1.92 TB NVMe RAID1" },
      { label: "Trafic lunar", value: "50 TB" },
      { label: "Acces root/IPMI", value: "Complet" },
      { label: "Protecție DDoS", value: "Inclusă" },
      { label: "Suport", value: "Prioritate maximă + contact dedicat" },
    ],
  },
];

export const domainPricing = [
  { tld: ".ro", priceRon: 39, note: "/an" },
  { tld: ".com", priceRon: 49, note: "/an" },
  { tld: ".eu", priceRon: 35, note: "/an" },
  { tld: ".net", priceRon: 55, note: "/an" },
];

export type ServicePackage = {
  name: string;
  tier: "Starter" | "Pro" | "Business";
  featured?: boolean;
  priceRon: number;
  priceUnit: "one-time" | "monthly";
  features: string[];
};

export const webDesignPackages: ServicePackage[] = [
  {
    name: "Landing Page",
    tier: "Starter",
    priceRon: 1490,
    priceUnit: "one-time",
    features: [
      "1 pagină, design personalizat",
      "Optimizat pentru mobil",
      "Formular de contact",
      "SEO on-page de bază",
      "Livrare în 5–7 zile lucrătoare",
    ],
  },
  {
    name: "Website Prezentare",
    tier: "Pro",
    featured: true,
    priceRon: 2990,
    priceUnit: "one-time",
    features: [
      "Până la 6 pagini",
      "Design personalizat pentru brand",
      "Optimizat pentru mobil",
      "SEO on-page inclus",
      "Integrare Google Analytics/Search Console",
      "Livrare în 10–14 zile lucrătoare",
    ],
  },
  {
    name: "Magazin Online",
    tier: "Business",
    priceRon: 5990,
    priceUnit: "one-time",
    features: [
      "Produse nelimitate",
      "Integrare plăți online",
      "Gestiune stocuri și comenzi",
      "SEO on-page inclus",
      "Livrare în 3–4 săptămâni",
    ],
  },
];

export const digitalMarketingPackages: ServicePackage[] = [
  {
    name: "Start",
    tier: "Starter",
    priceRon: 990,
    priceUnit: "monthly",
    features: [
      "Administrare 1 canal (Meta Ads sau Google Ads)",
      "Setup campanie și targetare",
      "Raport lunar de performanță",
    ],
  },
  {
    name: "Growth",
    tier: "Pro",
    featured: true,
    priceRon: 1990,
    priceUnit: "monthly",
    features: [
      "Administrare 2 canale (Meta + Google Ads)",
      "Optimizare continuă a campaniilor",
      "A/B testing pe reclame",
      "Raport bilunar de performanță",
    ],
  },
  {
    name: "Scale",
    tier: "Business",
    priceRon: 3490,
    priceUnit: "monthly",
    features: [
      "Strategie multi-canal dedicată",
      "Meta, Google Ads și TikTok Ads",
      "Raportare săptămânală",
      "Contact dedicat de cont",
    ],
  },
];

export const seoPackages: ServicePackage[] = [
  {
    name: "Local SEO",
    tier: "Starter",
    priceRon: 890,
    priceUnit: "monthly",
    features: [
      "Optimizare Google Business Profile",
      "10 cuvinte cheie locale",
      "Optimizare on-page de bază",
      "Raport lunar",
    ],
  },
  {
    name: "Growth SEO",
    tier: "Pro",
    featured: true,
    priceRon: 1690,
    priceUnit: "monthly",
    features: [
      "30 cuvinte cheie urmărite",
      "Content SEO (articole optimizate)",
      "Link building controlat",
      "Raport lunar detaliat",
    ],
  },
  {
    name: "Enterprise SEO",
    tier: "Business",
    priceRon: 2990,
    priceUnit: "monthly",
    features: [
      "Strategie SEO completă",
      "Audit tehnic aprofundat",
      "Content la scară",
      "Raportare săptămânală + contact dedicat",
    ],
  },
];

// ── Products / features / trust content ────────────────────────────────

export type ProductCategory = {
  slug: string;
  name: string;
  icon: "server" | "cpu" | "gamepad" | "globe" | "database";
  description: string;
  benefits: string[];
  href: string;
};

export const productCategories: ProductCategory[] = [
  {
    slug: "hosting",
    name: "Web Hosting",
    icon: "server",
    description: "Găzduire pentru site-uri și aplicații web, pe infrastructură NVMe, cu protecție DDoS inclusă.",
    benefits: [
      "Stocare NVMe pentru timpi de încărcare rapizi",
      "Protecție DDoS la nivel de rețea",
      "Panou de control pentru administrare site",
    ],
    href: "/hosting",
  },
  {
    slug: "vps",
    name: "VPS",
    icon: "cpu",
    description: "Servere virtuale private cu resurse dedicate, control complet și scalare pe măsură ce crești.",
    benefits: ["Resurse dedicate (CPU/RAM/stocare)", "Acces root complet", "Scalare fără migrare de date"],
    href: "/vps",
  },
  {
    slug: "game-servers",
    name: "Game Servers",
    icon: "gamepad",
    description: "Servere pentru comunități de gaming, cu instalare rapidă și rețea optimizată pentru latență.",
    benefits: ["Instalare rapidă a serverului", "Rețea optimizată pentru latență mică", "Panou de administrare"],
    href: "/game-servers",
  },
  {
    slug: "domains",
    name: "Domenii",
    icon: "globe",
    description: "Înregistrare și administrare domenii, cu DNS gestionat direct din contul RobixHost.",
    benefits: ["Căutare și înregistrare domeniu", "Administrare DNS centralizată", "Reînnoire gestionată din cont"],
    href: "/domains",
  },
  {
    slug: "dedicated-servers",
    name: "Dedicated Servers",
    icon: "database",
    description: "Servere fizice dedicate pentru aplicații cu cerințe ridicate de performanță și control complet.",
    benefits: ["Resurse hardware dedicate exclusiv", "Control complet la nivel de sistem", "IPMI inclus"],
    href: "/dedicated-servers",
  },
];

export type WhyFeature = {
  title: string;
  description: string;
  icon: "shield" | "zap" | "server" | "database" | "activity" | "clock" | "headset";
};

export const whyRobixHostFeatures: WhyFeature[] = [
  { title: "Protecție DDoS", description: "Filtrare de trafic malițios la nivel de rețea, activă implicit.", icon: "shield" },
  { title: "Stocare NVMe", description: "Discuri NVMe pentru citire/scriere rapidă pe toate planurile.", icon: "zap" },
  { title: "Performanță ridicată", description: "Infrastructură dimensionată pentru sarcini reale.", icon: "server" },
  { title: "Backup automat", description: "Politică de backup inclusă pe fiecare plan, conform specificațiilor.", icon: "activity" },
  { title: "Monitorizare", description: "Infrastructură monitorizată continuu.", icon: "clock" },
  { title: "Suport tehnic", description: "Echipă de suport disponibilă prin tichet și email.", icon: "headset" },
];

export const gameServerTitles = [
  { name: "Minecraft", confirmed: false },
  { name: "FiveM", confirmed: false },
  { name: "CS2", confirmed: false },
  { name: "Rust", confirmed: false },
];

export const statusServices = [
  { name: "Web Hosting", status: "operational" as const },
  { name: "VPS", status: "operational" as const },
  { name: "Game Servers", status: "operational" as const },
  { name: "Network", status: "operational" as const },
  { name: "DNS", status: "operational" as const },
  { name: "Control Panel", status: "operational" as const },
];

export const faqItems = [
  {
    question: "Ce este hostingul?",
    answer:
      "Hostingul este serviciul prin care site-ul sau aplicația ta este găzduită pe un server conectat permanent la internet, astfel încât să fie accesibilă vizitatorilor.",
  },
  {
    question: "Ce protecție DDoS oferiți?",
    answer:
      "Traficul este filtrat la nivel de rețea, implicit, pe toate planurile — pentru a reduce impactul atacurilor de tip DDoS asupra site-ului sau serverului tău.",
  },
  {
    question: "Cum comand?",
    answer:
      "Alegi planul potrivit și finalizezi comanda din contul de client RobixHost (clienti.robixhost.ro), unde ai acces și la facturare, suport și administrarea serviciilor.",
  },
  {
    question: "Pot face upgrade?",
    answer: "Da — planurile sunt gândite să permită upgrade din contul de client, pe măsură ce nevoile cresc.",
  },
  {
    question: "Cum funcționează backupurile?",
    answer:
      "Backupurile automate sunt incluse conform planului ales — frecvența exactă (săptămânală/zilnică) este afișată la fiecare plan din pagina de prețuri.",
  },
  {
    question: "Ce metode de plată acceptați?",
    answer:
      "Plata se face securizat prin contul de client (clienti.robixhost.ro). Metodele exact active vor fi confirmate acolo la momentul comenzii.",
  },
  {
    question: "Cum contactez suportul?",
    answer: "Prin pagina de Suport, care centralizează FAQ, contact și status infrastructură.",
  },
];

export const paymentMethods = [
  { name: "Visa", confirmed: true },
  { name: "Mastercard", confirmed: true },
  { name: "Transfer bancar", confirmed: true },
];

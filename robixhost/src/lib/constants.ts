// Central content/config for the RobixHost site.
// Anything not confirmed by the business is marked TODO / "CONFIG HERE" —
// never a fabricated number, date, location, or claim. See CLAUDE.md.

export const siteConfig = {
  name: "ROBIXHOST",
  domain: "robixhost.ro",
  url: "https://robixhost.ro",
  tagline: "Hosting built for what's next.",
  description:
    "Web hosting, VPS, game servers și domenii cu protecție DDoS și infrastructură NVMe, pentru afaceri din România.",
  supportEmail: "support@robixhost.ro", // TODO: confirm real support inbox
  salesEmail: "sales@robixhost.ro", // TODO: confirm real sales inbox
};

// Legal/company identity — required on a Romanian commercial site, but not
// something to invent. Every value here must be supplied by the business
// owner (or verified by counsel) before launch.
export const legalConfig = {
  companyLegalName: "TODO — denumirea legală completă a societății (ex: S.C. ROBIXHOST S.R.L.)",
  registrationNumber: "TODO — Nr. Registrul Comerțului (J.../.../....)",
  fiscalCode: "TODO — CUI/CIF",
  registeredAddress: "TODO — sediul social complet",
  contactAddress: "TODO — adresă de corespondență, dacă diferă",
  anpcNote:
    "TODO — verificați obligațiile de afișare ANPC (link SOL, link ANPC) aplicabile activității companiei",
};

export const navLinks = [
  { label: "Servere", href: "/#infrastructure" },
  { label: "Hosting", href: "/hosting" },
  { label: "VPS", href: "/vps" },
  { label: "Game Servers", href: "/game-servers" },
  { label: "Domenii", href: "/domains" },
  { label: "Despre noi", href: "/about" },
  { label: "Suport", href: "/support" },
];

export const footerLinks = {
  products: [
    { label: "Web Hosting", href: "/hosting" },
    { label: "VPS", href: "/vps" },
    { label: "Game Servers", href: "/game-servers" },
    { label: "Dedicated Servers", href: "/dedicated-servers" },
    { label: "Domenii", href: "/domains" },
    { label: "Prețuri", href: "/pricing" },
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

export type PlanFeature = { label: string; value: string };

export type HostingPlan = {
  name: string;
  tier: "Starter" | "Pro" | "Business";
  featured?: boolean;
  price: string; // TODO: real price
  billingNote: string;
  features: PlanFeature[];
};

const PRICE_TODO = "TODO €/lună";

export const hostingPlans: HostingPlan[] = [
  {
    name: "Starter",
    tier: "Starter",
    price: PRICE_TODO,
    billingNote: "CONFIG HERE — ciclu de facturare",
    features: [
      { label: "Stocare NVMe", value: "TODO GB" },
      { label: "Trafic lunar", value: "TODO" },
      { label: "Website-uri", value: "TODO" },
      { label: "Baze de date", value: "TODO" },
      { label: "Certificat SSL", value: "TODO" },
      { label: "Backup automat", value: "TODO" },
      { label: "Protecție DDoS", value: "TODO" },
      { label: "Suport", value: "TODO" },
    ],
  },
  {
    name: "Pro",
    tier: "Pro",
    featured: true,
    price: PRICE_TODO,
    billingNote: "CONFIG HERE — ciclu de facturare",
    features: [
      { label: "Stocare NVMe", value: "TODO GB" },
      { label: "Trafic lunar", value: "TODO" },
      { label: "Website-uri", value: "TODO" },
      { label: "Baze de date", value: "TODO" },
      { label: "Certificat SSL", value: "TODO" },
      { label: "Backup automat", value: "TODO" },
      { label: "Protecție DDoS", value: "TODO" },
      { label: "Suport", value: "TODO" },
    ],
  },
  {
    name: "Business",
    tier: "Business",
    price: PRICE_TODO,
    billingNote: "CONFIG HERE — ciclu de facturare",
    features: [
      { label: "Stocare NVMe", value: "TODO GB" },
      { label: "Trafic lunar", value: "TODO" },
      { label: "Website-uri", value: "TODO" },
      { label: "Baze de date", value: "TODO" },
      { label: "Certificat SSL", value: "TODO" },
      { label: "Backup automat", value: "TODO" },
      { label: "Protecție DDoS", value: "TODO" },
      { label: "Suport", value: "TODO" },
    ],
  },
];

function buildPlans(featureLabels: string[]): HostingPlan[] {
  const tiers: { name: HostingPlan["tier"]; featured?: boolean }[] = [
    { name: "Starter" },
    { name: "Pro", featured: true },
    { name: "Business" },
  ];
  return tiers.map((tier) => ({
    name: tier.name,
    tier: tier.name,
    featured: tier.featured,
    price: PRICE_TODO,
    billingNote: "CONFIG HERE — ciclu de facturare",
    features: featureLabels.map((label) => ({ label, value: "TODO" })),
  }));
}

export const vpsPlans: HostingPlan[] = buildPlans([
  "vCPU",
  "RAM",
  "Stocare NVMe",
  "Trafic lunar",
  "Acces root",
  "Backup automat",
  "Protecție DDoS",
  "Suport",
]);

export const gameServerPlans: HostingPlan[] = buildPlans([
  "RAM",
  "Sloturi jucători",
  "Stocare NVMe",
  "Locație server",
  "Panou de administrare",
  "Backup automat",
  "Protecție DDoS",
  "Suport",
]);

export const dedicatedServerPlans: HostingPlan[] = buildPlans([
  "CPU",
  "RAM",
  "Stocare",
  "Rețea",
  "Acces root/IPMI",
  "Redundanță",
  "Protecție DDoS",
  "Suport",
]);

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
    description:
      "Găzduire pentru site-uri și aplicații web, pe infrastructură NVMe, cu protecție DDoS inclusă la nivel de rețea.",
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
    description:
      "Servere virtuale private cu resurse dedicate, control complet și scalare pe măsură ce afacerea crește.",
    benefits: [
      "Resurse dedicate (CPU/RAM/stocare)",
      "Acces root complet",
      "Scalare fără migrare de date",
    ],
    href: "/vps",
  },
  {
    slug: "game-servers",
    name: "Game Servers",
    icon: "gamepad",
    description:
      "Servere pentru comunități de gaming, cu instalare rapidă și infrastructură pregătită pentru trafic în timp real.",
    benefits: [
      "Instalare rapidă a serverului de joc",
      "Rețea optimizată pentru latență mică",
      "Panou de administrare pentru comunitate",
    ],
    href: "/game-servers",
  },
  {
    slug: "domains",
    name: "Domenii",
    icon: "globe",
    description:
      "Înregistrare și administrare domenii, cu DNS gestionat direct din contul RobixHost.",
    benefits: [
      "Căutare și înregistrare domeniu",
      "Administrare DNS centralizată",
      "Reînnoire gestionată din cont",
    ],
    href: "/domains",
  },
  {
    slug: "dedicated-servers",
    name: "Dedicated Servers",
    icon: "database",
    description:
      "Servere fizice dedicate pentru aplicații cu cerințe ridicate de performanță, izolare și control complet.",
    benefits: [
      "Resurse hardware dedicate exclusiv",
      "Control complet la nivel de sistem",
      "Opțiuni de rețea și redundanță — CONFIG HERE",
    ],
    href: "/dedicated-servers",
  },
];

export type WhyFeature = { title: string; description: string; icon: "shield" | "zap" | "server" | "database" | "activity" | "clock" | "headset" };

export const whyRobixHostFeatures: WhyFeature[] = [
  {
    title: "Protecție DDoS",
    description: "Filtrare de trafic malițios la nivel de rețea, activă implicit pe infrastructura RobixHost.",
    icon: "shield",
  },
  {
    title: "Stocare NVMe",
    description: "Discuri NVMe pentru citire/scriere rapidă — timpi de răspuns mai buni pentru site și aplicații.",
    icon: "zap",
  },
  {
    title: "Performanță ridicată",
    description: "Infrastructură dimensionată pentru sarcini reale, nu doar pentru teste sintetice.",
    icon: "server",
  },
  {
    title: "Infrastructură fiabilă",
    description: "Arhitectură construită pentru continuitate — detalii de redundanță: CONFIG HERE.",
    icon: "database",
  },
  {
    title: "Backup automat",
    description: "Politică de backup configurabilă per plan — frecvență și retenție: CONFIG HERE.",
    icon: "activity",
  },
  {
    title: "Monitorizare 24/7",
    description: "Monitorizare continuă a infrastructurii — SLA și praguri de alertă: CONFIG HERE.",
    icon: "clock",
  },
  {
    title: "Suport rapid",
    description: "Echipă de suport tehnic disponibilă pentru clienți RobixHost — canale și program: CONFIG HERE.",
    icon: "headset",
  },
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
      "Traficul este filtrat la nivel de rețea pentru a reduce impactul atacurilor de tip DDoS. Detalii tehnice complete despre capacitate și metodologie: CONFIG HERE.",
  },
  {
    question: "Cum comand?",
    answer:
      "Alegi planul potrivit din pagina de prețuri, urmezi pașii din procesul de comandă și primești acces la serviciu după confirmarea plății. Fluxul exact de checkout: CONFIG HERE.",
  },
  {
    question: "Pot face upgrade?",
    answer:
      "Da — planurile sunt gândite să permită upgrade pe măsură ce nevoile cresc. Procesul exact (imediat / la reînnoire) va fi confirmat: CONFIG HERE.",
  },
  {
    question: "Cum funcționează backupurile?",
    answer:
      "Backupurile automate sunt incluse conform planului ales. Frecvența, retenția și procesul de restaurare: CONFIG HERE.",
  },
  {
    question: "Ce metode de plată acceptați?",
    answer:
      "Structura de plată este pregătită pentru integrare (vezi secțiunea de plăți din footer). Metodele efectiv active vor fi confirmate înainte de lansare — CONFIG HERE.",
  },
  {
    question: "Cum contactez suportul?",
    answer:
      "Prin pagina de Suport, care centralizează FAQ, contact și status infrastructură. Canalele live (chat/telefon) și programul de lucru: CONFIG HERE.",
  },
];

export const paymentMethods = [
  { name: "Visa", confirmed: false },
  { name: "Mastercard", confirmed: false },
  { name: "Apple Pay", confirmed: false },
  { name: "Google Pay", confirmed: false },
  { name: "PayPal", confirmed: false },
  { name: "Stripe", confirmed: false },
];

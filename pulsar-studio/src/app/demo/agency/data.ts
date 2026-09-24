// Fictional demo business — built to showcase CreareWebsitePro's work, not a
// real agency. Case studies are explicitly labeled demo/concept, never
// presented as real client results.

export const agency = {
  name: "FIELD",
  tagline: "Brand, digital și strategie — pentru companii care vor să conteze.",
  email: "hello@field-demo.studio",
};

export const navLinks = [
  { label: "Proiecte", href: "#proiecte" },
  { label: "Servicii", href: "#servicii" },
  { label: "Despre", href: "#despre" },
  { label: "Contact", href: "#contact" },
];

export type CaseStudy = {
  id: string;
  category: string;
  title: string;
  summary: string;
  color: string;
  objective: string;
  solution: string;
  tech: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "cs1",
    category: "Brand & Digital",
    title: "Repoziționare brand pentru un retailer regional",
    summary: "Identitate vizuală nouă și un website reconstruit de la zero.",
    color: "#ff4d1c",
    objective: "Brandul nu mai reflecta calitatea produselor — identitatea vizuală era inconsistentă pe toate canalele.",
    solution: "Sistem de identitate complet nou, ghid de brand și un website construit pe aceleași principii vizuale.",
    tech: ["Next.js", "Design System", "Framer Motion"],
  },
  {
    id: "cs2",
    category: "Produs digital",
    title: "Platformă de rezervări pentru un lanț de saloane",
    summary: "De la programări prin telefon la un sistem online complet.",
    color: "#1c1c1c",
    objective: "Programările prin telefon consumau timp și generau erori de suprapunere.",
    solution: "Aplicație web cu calendar în timp real, notificări automate și panou de administrare pentru echipă.",
    tech: ["Next.js", "Supabase", "Stripe"],
  },
  {
    id: "cs3",
    category: "Campanie",
    title: "Lansare produs pentru un brand de lifestyle",
    summary: "Landing page și campanie coordonată pentru un lansare de produs.",
    color: "#4a5d4e",
    objective: "Lansare cu fereastră scurtă de timp și obiectiv clar de generare de precomenzi.",
    solution: "Landing page cu un singur obiectiv de conversie, integrat cu campania de social media.",
    tech: ["Next.js", "Analytics", "A/B Testing"],
  },
  {
    id: "cs4",
    category: "Brand & Digital",
    title: "Website corporate pentru o firmă de consultanță",
    summary: "Structură clară pe servicii, construită pentru credibilitate.",
    color: "#8a5a3b",
    objective: "Site-ul vechi nu comunica expertiza reală a echipei și genera puține lead-uri calificate.",
    solution: "Arhitectură de informație refăcută, studii de caz proprii și formulare de contact optimizate.",
    tech: ["Next.js", "SEO tehnic", "CMS headless"],
  },
];

export const services = [
  { name: "Brand & identitate", description: "Strategie de brand, identitate vizuală, ghiduri complete." },
  { name: "Website & produs digital", description: "De la landing page la aplicații web complete." },
  { name: "Campanii & lansări", description: "Coordonare creativă pentru momente cheie de business." },
  { name: "Strategie digitală", description: "SEO, analytics și optimizare pentru conversii." },
];

export const projectTypeOptions = ["Brand nou", "Website", "Produs digital", "Campanie", "Nu sunt sigur încă"];

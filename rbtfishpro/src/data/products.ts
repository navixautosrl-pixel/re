/**
 * The RBT Fish Pro range, as shown on the client's range poster:
 * Fishmeal (fără aromă, fără conservanți), Fishmeal cu squid & prună,
 * Birdfood Scopex, Birdfood Căpșună — each 20 or 24 mm.
 * Prices, pack weights, ingredients and availability were NOT supplied:
 * they're development placeholders (see site.catalog.pricesConfirmed).
 */
export type Range = "fishmeal" | "birdfood";
export type Diameter = 20 | 24;

export type Product = {
  slug: string;
  name: string;
  range: Range;
  flavour: string; // as on the poster
  flavourKey: "natural" | "squid-pruna" | "scopex" | "capsuni";
  diameters: Diameter[];
  /** Only statements printed on the client's materials. */
  verifiedFacts: string[];
  summary: string;
  image: { base: string; width: number; height: number; alt: string };
  /** PLACEHOLDER price in RON — replace and set site.catalog.pricesConfirmed = true. */
  price: number;
  packWeight: string | null; // e.g. "1 kg" — not supplied
  ingredients: string | null; // not supplied
  availability: "la-comanda" | "in-stoc" | "indisponibil" | null; // not supplied
  accent: string; // card accent derived from the bag's own flavour colour
  seoTitle: string;
  seoDescription: string;
};

export const products: Product[] = [
  {
    slug: "boilies-fishmeal",
    name: "Fishmeal",
    range: "fishmeal",
    flavour: "Fără aromă",
    flavourKey: "natural",
    diameters: [20, 24],
    verifiedFacts: ["Fără aromă", "Fără conservanți", "Fără arome artificiale", "Diametru 20 sau 24 mm"],
    summary: "Boilies pe bază de făină de pește, fără aromă și fără conservanți. Gustul bazei, fără nimic adăugat peste el.",
    image: { base: "/img/bag-fishmeal-245", width: 245, height: 420, alt: "Punga de boilies RBT Fish Pro Fishmeal, cu boilies maro din făină de pește" },
    price: 50,
    packWeight: null,
    ingredients: null,
    availability: null,
    accent: "oklch(66% 0.08 70)",
    seoTitle: "Boilies Fishmeal fără aromă pentru crap, 20 și 24 mm",
    seoDescription: "Boilies Fishmeal RbtFishPro pentru pescuitul la crap: fără aromă, fără conservanți, fără arome artificiale. Diametru 20 sau 24 mm.",
  },
  {
    slug: "boilies-fishmeal-squid-pruna",
    name: "Fishmeal Squid & Prună",
    range: "fishmeal",
    flavour: "Squid & prună",
    flavourKey: "squid-pruna",
    diameters: [20, 24],
    verifiedFacts: ["Bază fishmeal", "Aromă squid (calmar) și prună", "Diametru 20 sau 24 mm"],
    summary: "Baza de fishmeal, cu aromă de calmar și prună — o combinație de mare și fruct închis la culoare.",
    image: { base: "/img/bag-fishmeal-squid-pruna-244", width: 244, height: 420, alt: "Punga de boilies RBT Fish Pro Fishmeal cu squid și prună, cu boilies roșcate, calmar și prune" },
    price: 55,
    packWeight: null,
    ingredients: null,
    availability: null,
    accent: "oklch(58% 0.12 25)",
    seoTitle: "Boilies Fishmeal Squid & Prună pentru crap, 20 și 24 mm",
    seoDescription: "Boilies RbtFishPro pe bază de fishmeal, cu aromă de squid (calmar) și prună, pentru pescuitul la crap. Diametru 20 sau 24 mm.",
  },
  {
    slug: "boilies-birdfood-scopex",
    name: "Birdfood Scopex",
    range: "birdfood",
    flavour: "Scopex",
    flavourKey: "scopex",
    diameters: [20, 24],
    verifiedFacts: ["Bază birdfood", "Aromă Scopex", "Diametru 20 sau 24 mm"],
    summary: "Baza birdfood, cu Scopex — aroma dulce, cremoasă, clasică în pescuitul la crap.",
    image: { base: "/img/bag-birdfood-scopex-244", width: 244, height: 420, alt: "Punga de boilies RBT Fish Pro Birdfood Scopex, cu boilies galbene" },
    price: 55,
    packWeight: null,
    ingredients: null,
    availability: null,
    accent: "oklch(84% 0.15 95)",
    seoTitle: "Boilies Birdfood Scopex pentru crap, 20 și 24 mm",
    seoDescription: "Boilies RbtFishPro Birdfood cu aromă Scopex pentru pescuitul la crap. Diametru 20 sau 24 mm.",
  },
  {
    slug: "boilies-birdfood-capsuni",
    name: "Birdfood Căpșună",
    range: "birdfood",
    flavour: "Căpșună",
    flavourKey: "capsuni",
    diameters: [20, 24],
    verifiedFacts: ["Bază birdfood", "Aromă de căpșună", "Diametru 20 sau 24 mm"],
    summary: "Baza birdfood, cu aromă de căpșună — dulce, fructată, ușor de recunoscut în apă.",
    image: { base: "/img/bag-birdfood-capsuni-245", width: 245, height: 420, alt: "Punga de boilies RBT Fish Pro Birdfood Căpșună, cu boilies roșii și căpșuni" },
    price: 55,
    packWeight: null,
    ingredients: null,
    availability: null,
    accent: "oklch(60% 0.2 15)",
    seoTitle: "Boilies Birdfood Căpșună pentru crap, 20 și 24 mm",
    seoDescription: "Boilies RbtFishPro Birdfood cu aromă de căpșună pentru pescuitul la crap. Diametru 20 sau 24 mm.",
  },
];

export const RANGES: Record<Range, { label: string; blurb: string }> = {
  fishmeal: { label: "Fishmeal", blurb: "Bază de făină de pește." },
  birdfood: { label: "Birdfood", blurb: "Bază birdfood, cu arome dulci." },
};

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

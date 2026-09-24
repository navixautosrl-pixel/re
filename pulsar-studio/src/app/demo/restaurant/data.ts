// Fictional demo business — built to showcase CreareWebsitePro's work, not a
// real restaurant. No real menu, prices, chef, or reviews are represented.

export const restaurant = {
  name: "Ember",
  tagline: "Bucătărie de foc deschis, într-un spațiu intim.",
  city: "București",
  address: "Str. Demo nr. 12, București",
  phone: "+40 700 000 000",
  hours: "Marți – Duminică, 18:00 – 24:00",
};

export const navLinks = [
  { label: "Acasă", href: "#acasa" },
  { label: "Meniu", href: "#meniu" },
  { label: "Galerie", href: "#galerie" },
  { label: "Despre", href: "#despre" },
  { label: "Rezervări", href: "#rezervare" },
  { label: "Contact", href: "#contact" },
];

export type MenuItem = { name: string; description: string; price: string };
export type MenuCategory = { id: string; label: string; items: MenuItem[] };

export const menu: MenuCategory[] = [
  {
    id: "aperitive",
    label: "Aperitive",
    items: [
      { name: "Tartar de vită afumat", description: "Ceapă caramelizată, gălbenuș confiat, pâine de secară la jar", price: "58 lei" },
      { name: "Burrata la grătar", description: "Roșii uscate la soare, ulei de busuioc, pesmet de măsline", price: "52 lei" },
      { name: "Supă cremă de dovleac afumat", description: "Semințe prăjite, ulei de dovleac, chips de salvie", price: "38 lei" },
    ],
  },
  {
    id: "principale",
    label: "Feluri principale",
    items: [
      { name: "Antricot de vită la jar", description: "300g, cartofi confiați, unt de ierburi, jus de vin roșu", price: "148 lei" },
      { name: "Piept de rață afumat", description: "Piure de țelină, cireșe confiate, sos de portocale", price: "112 lei" },
      { name: "Pește alb la grătar", description: "Legume de sezon la jar, unt de lămâie, ierburi proaspete", price: "104 lei" },
      { name: "Risotto de ciuperci sălbatice", description: "Parmezan în vârstă, trufe de sezon, unt afumat", price: "86 lei" },
    ],
  },
  {
    id: "deserturi",
    label: "Deserturi",
    items: [
      { name: "Tarta de ciocolată afumată", description: "Cremă de mascarpone, praline sărate", price: "42 lei" },
      { name: "Cremă catalană de vanilie", description: "Caramel crocant, fructe de pădure proaspete", price: "36 lei" },
    ],
  },
  {
    id: "bauturi",
    label: "Băuturi",
    items: [
      { name: "Selecție vinuri roșii, pahar", description: "Selecție curatoriată, schimbată sezonier", price: "de la 32 lei" },
      { name: "Cocktail semnătură Ember", description: "Whisky afumat, sirop de portocală arsă, bitter de plante", price: "48 lei" },
    ],
  },
];

export const galleryItems = [
  { id: "g1", label: "Sala principală", pattern: "linear-gradient(135deg, #241d14, #3a2c18)" },
  { id: "g2", label: "Bucătăria deschisă", pattern: "linear-gradient(135deg, #1c160f, #4a2f18)" },
  { id: "g3", label: "Grătarul pe cărbune", pattern: "linear-gradient(135deg, #2a1a10, #c9a15a)" },
  { id: "g4", label: "Bar & cocktailuri", pattern: "linear-gradient(135deg, #1c160f, #8a5a3b)" },
  { id: "g5", label: "Terasa de vară", pattern: "linear-gradient(135deg, #241d14, #6b4423)" },
  { id: "g6", label: "Farfurie semnătură", pattern: "linear-gradient(135deg, #3a2c18, #c9a15a)" },
];

export const partySizes = ["1 persoană", "2 persoane", "3 persoane", "4 persoane", "5 persoane", "6+ persoane"];

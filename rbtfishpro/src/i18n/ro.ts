/**
 * UI strings shared across components. Page copy lives with each page.
 * To add English: create en.ts with the same keys (TypeScript enforces it via `Dict`)
 * and route /en/* to it — see README "Limbi".
 */
export const ro = {
  nav: {
    home: "Acasă",
    shop: "Magazin",
    about: "Despre noi",
    faq: "Întrebări frecvente",
    contact: "Contact",
    cart: "Coș",
    menu: "Meniu",
    close: "Închide",
    skip: "Sari la conținut",
    primary: "Navigare principală",
  },
  product: {
    diameter: "Diametru",
    quantity: "Cantitate",
    add: "Adaugă în coș",
    added: "Adăugat în coș",
    view: "Vezi produsul",
    examplePrice: "Preț exemplu",
    availabilityUnknown: "Disponibilitatea se confirmă la comandă",
    related: "Din aceeași gamă",
    inapt: "Inapt consumului uman",
  },
  cart: {
    title: "Coșul tău",
    empty: "Coșul e gol.",
    emptyHint: "Alege o rețetă și un diametru din magazin.",
    subtotal: "Subtotal",
    shipping: "Livrare",
    shippingTbc: "se confirmă la comandă",
    total: "Total",
    remove: "Elimină",
    checkout: "Finalizează comanda",
    continue: "Continuă cumpărăturile",
    decrease: "Scade cantitatea",
    increase: "Crește cantitatea",
  },
  form: {
    required: "obligatoriu",
    optional: "opțional",
    sending: "Se trimite…",
    fix: "Verifică câmpurile marcate:",
    networkError: "Nu am putut trimite. Verifică conexiunea și încearcă din nou.",
    rateLimited: "Prea multe încercări într-un timp scurt. Încearcă din nou peste un minut.",
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof ro>;
export const t: Dict = ro;

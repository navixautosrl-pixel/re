/**
 * Every business fact the site shows lives here. `null` means "not supplied yet":
 * the UI renders a visible <Placeholder> instead of inventing a value.
 * Verified sources: RBT Fish Pro packaging label, range poster and catch photos
 * supplied by the client (2026-10-09).
 */
export const site = {
  name: "RbtFishPro",
  legalName: null as string | null, // denumirea firmei (SRL/PFA) — de completat
  domain: "www.rbtfishpro.ro", // verified: printed on packaging
  url: (process.env.SITE_URL || "https://www.rbtfishpro.ro").replace(/\/$/, ""),
  /** Search engines are blocked until the business details below are confirmed. */
  indexable: process.env.SITE_INDEXABLE === "true",
  locale: "ro-RO",
  lang: "ro",
  currency: "RON",
  contact: {
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
    hours: null as string | null,
    whatsapp: null as string | null,
  },
  company: {
    cui: null as string | null,
    regCom: null as string | null,
    hq: null as string | null,
  },
  social: [] as { label: string; url: string }[], // add real profiles only
  catalog: {
    /** false → every price is shown as "Preț exemplu" and orders need ALLOW_PLACEHOLDER_ORDERS=true. */
    pricesConfirmed: false,
    vatIncluded: null as boolean | null,
  },
  shipping: {
    /** null → "Costul livrării se confirmă odată cu comanda." */
    flatFee: null as number | null,
    freeOver: null as number | null,
    carriers: null as string | null,
    leadTime: null as string | null,
  },
  payment: {
    /** Offered at checkout. Card payments need a processor (e.g. Stripe) — not configured. */
    methods: [
      { id: "ramburs", label: "Plată la livrare (ramburs)", confirmed: false },
      { id: "transfer", label: "Transfer bancar", confirmed: false },
    ],
  },
  newsletter: { enabled: false }, // needs a provider (e.g. MailerLite/Brevo) + double opt-in
} as const;

export type PaymentMethodId = (typeof site.payment.methods)[number]["id"];

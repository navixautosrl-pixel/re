/**
 * Business facts. `null` = not supplied yet → the page shows a visible placeholder
 * instead of an invented value (grep "data-placeholder" in the export to list them).
 */
export const site = {
  /** Brand = the domain (client, 2026-10-12). */
  name: "Tractări Auto București 24",
  nameConfirmed: true,
  legalName: "MATDOR TRANS SRL" as string | null,
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://tractariautobucuresti24.ro").replace(/\/$/, ""),
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
  /** International format, e.g. "+40722123456". Drives the call + WhatsApp buttons. */
  phone: "+40773938355" as string | null,
  /** Shown to people, e.g. "0722 123 456". */
  phoneDisplay: "0773 938 355" as string | null,
  whatsapp: "40773938355" as string | null, // same number as calls — change if WhatsApp is on another
  email: null as string | null,
  /** From the client (2026-10-12): main areas Chiajna, Militari, A1, Centura + adjacent. */
  serviceArea: "Chiajna, Militari, A1 București–Pitești, Centura București și zonele din jur" as string | null,
  /** Confirmed by the client (2026-10-12): non-stop, 7 days a week. */
  hours: "Non-stop, 24/7" as string | null,
  /** schema.org openingHours for the hours above. */
  openingHoursSchema: "Mo-Su 00:00-23:59" as string | null,
  company: {
    cui: "49384800" as string | null,
    regCom: "J23/158/2024" as string | null,
    euid: "ROONRC.J23/158/2024",
    founded: "2024-01-10",
    address: "Str. Viilor nr. 6D, Sat Dudu, Comuna Chiajna, Jud. Ilfov, 077041" as string | null,
    street: "Str. Viilor nr. 6D",
    locality: "Dudu, Chiajna",
    region: "Ilfov",
    postalCode: "077041",
  },
  /** Business model (client, 2026-10-13): dispatcher working with many partner platforms. */
  dispatcher: true,
  payment: ["numerar (cash)", "transfer bancar"],
  /** Google Maps key (Places API New + Routes API), restricted to the site's domain. Optional. */
  mapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
} as const;

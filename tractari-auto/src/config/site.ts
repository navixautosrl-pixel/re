/**
 * Business facts. `null` = not supplied yet → the page shows a visible placeholder
 * instead of an invented value (grep "data-placeholder" in the export to list them).
 */
export const site = {
  /** Working name until the real company name is supplied. */
  name: "Tractări Auto",
  nameConfirmed: false,
  legalName: null as string | null,
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.exemplu-tractari.ro").replace(/\/$/, ""),
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
  /** International format, e.g. "+40722123456". Drives the call + WhatsApp buttons. */
  phone: null as string | null,
  /** Shown to people, e.g. "0722 123 456". */
  phoneDisplay: null as string | null,
  whatsapp: null as string | null, // international digits, e.g. "40722123456"
  email: null as string | null,
  /** From the client's brief (2026-10-12): București, Centura, A1 București–Pitești. Edit if it changes. */
  serviceArea: "București, Ilfov, Centura București și A1 București–Pitești" as string | null,
  /** Confirmed by the client (2026-10-12): non-stop, 7 days a week. */
  hours: "Non-stop, 24/7" as string | null,
  /** schema.org openingHours for the hours above. */
  openingHoursSchema: "Mo-Su 00:00-23:59" as string | null,
  company: { cui: null as string | null, regCom: null as string | null, address: null as string | null },
  /** Google Maps key (Places API New + Routes API), restricted to the site's domain. Optional. */
  mapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
} as const;

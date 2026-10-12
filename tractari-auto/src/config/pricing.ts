/**
 * Tariffs — reconstructed from six simulations of the reference calculator (bursatractari.ro,
 * screenshots supplied by the client on 2026-10-12, route București → Cluj-Napoca, 457 km):
 *
 *   total = MULTIPLIER × (intraKm × intraRate + extraKm × extraRate)
 *
 * With the rates as displayed there (1 decimal) and MULTIPLIER = 1.25 the six totals are
 * reproduced within −0.6 % … +1.3 % (tests/pricing.test.ts). The reference shows its rates
 * rounded, so exact parity needs a second simulation per vehicle on a different route
 * (two equations → the two unrounded rates). See README "Tarife".
 */
export type VehicleId = "moto" | "hatchback" | "sedan" | "suv" | "microbuz" | "duba";

export type Vehicle = {
  id: VehicleId;
  name: string;
  weight: string;
  /** lei/km, "Intra-City" column of the reference */
  intraRate: number;
  /** lei/km, "Extra-City" column of the reference */
  extraRate: number;
};

export const VEHICLES: Vehicle[] = [
  { id: "moto", name: "Motocicletă", weight: "Între 100 și 300 kg", intraRate: 3.3, extraRate: 2.3 },
  { id: "hatchback", name: "Hatchback", weight: "Între 700 și 1.500 kg", intraRate: 4.4, extraRate: 2.8 },
  { id: "sedan", name: "Sedan", weight: "Între 1.200 și 2.200 kg", intraRate: 5.2, extraRate: 3.6 },
  { id: "suv", name: "SUV", weight: "Între 1.500 și 2.500 kg", intraRate: 7.3, extraRate: 5.4 },
  { id: "microbuz", name: "Microbuz", weight: "Între 2.000 și 3.500 kg, 16–24 locuri", intraRate: 10.3, extraRate: 7.5 },
  { id: "duba", name: "Autoutilitară", weight: "Între 3.000 și 7.500 kg", intraRate: 10.5, extraRate: 12.0 },
];

export const PRICING = {
  multiplier: 1.25,
  /**
   * ASSUMPTION (to confirm): in the reference, 457 km split as 427 "Intra-City" + 30 "Extra-City".
   * One route can't show the rule, so the first EXTRA_KM of every route are billed at extraRate
   * and the rest at intraRate. A short simulation (e.g. 10 km inside one city) settles it.
   */
  extraKm: 30,
  /** Average speed implied by the reference: 457 km ≈ 5.84 h. Used when no route service is set. */
  avgSpeedKmh: 457 / 5.84,
  /** Minimum charge for any trip, in lei (client, 2026-10-12: "cursa minimă ~200 lei"). */
  minTotal: 200,
  freeWaitMinutes: 30,
  waitPerHour: 100,
  /** Surcharge for a damaged vehicle with locked wheels — not visible in the screenshots. */
  damagedMultiplier: null as number | null,
  maxKm: 3000,
};

export const DOCUMENTS = [
  { title: "Certificatul de înmatriculare (talonul)" },
  { title: "Factura de achiziție", note: "Pentru mașinile cumpărate de la dealeri sau parcuri auto." },
  { title: "Actul de identitate" },
  { title: "Nota de comandă" },
];

export const byId = (id: string) => VEHICLES.find((v) => v.id === id);

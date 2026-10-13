/**
 * Tariffs — reconstructed from six simulations of the reference calculator (bursatractari.ro,
 * screenshots supplied by the client on 2026-10-12, route București → Cluj-Napoca, 457 km):
 *
 *   short trips (urban):  total = MULTIPLIER × (loadFee + unloadFee + km × short.intraRate)
 *   mid trips (regional): total = MULTIPLIER × (loadFee + mid.unloadFee + (km − 1) × mid.intraRate + 1 × extraRate)
 *   long trips:           total = MULTIPLIER × (intraKm × intraRate + extraKm × extraRate)
 *   above SHORT_MAX_KM the reference charges the higher of mid and long.
 *
 * Mid-trip data: SUV, Roșu → Bucșani, 70,1 km = 800,65 lei (client screenshot, 2026-10-13):
 * 69 km × 6,3 + 1 km × 5,4, load 120 + unload 80 lei, reproduced to the ban. Across all
 * vehicles the urban rates are the mid rates × 1,4 and the mid Extra rate equals the long one,
 * so the mid Intra rates of the other vehicles are urban ÷ 1,4. Their mid unload fee is ASSUMED
 * to scale like the SUV's (120 → 80, i.e. ⅔, rounded to 10 lei) until a screenshot confirms it.
 *
 * Short-trip data: Militari → Drumul Taberei (3,1 km) for all six vehicles; the motorcycle total
 * (239,82 lei) is reproduced within 0,1 %. Urban rates are ≈ ×1,2 (Intra) and ×1,4 (Extra) the
 * long-trip ones; load + unload fees only appear on the short trip.
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
  /** Short (urban) trips, from the client's Militari → Drumul Taberei simulations (3,1 km). */
  short: { intraRate: number; extraRate: number; loadFee: number; unloadFee: number };
  /** Mid (regional) trips with load/unload fees — SUV observed, others derived (see above). */
  mid: { intraRate: number; unloadFee: number };
  /** lei/km, "Intra-City" column of the reference */
  intraRate: number;
  /** lei/km, "Extra-City" column of the reference */
  extraRate: number;
};

export const VEHICLES: Vehicle[] = [
  { id: "moto", name: "Motocicletă", weight: "Între 100 și 300 kg", intraRate: 3.3, extraRate: 2.3, mid: { intraRate: 2.8, unloadFee: 60 }, short: { intraRate: 3.9, extraRate: 3.2, loadFee: 90, unloadFee: 90 } },
  { id: "hatchback", name: "Hatchback", weight: "Între 700 și 1.500 kg", intraRate: 4.4, extraRate: 2.8, mid: { intraRate: 3.8, unloadFee: 70 }, short: { intraRate: 5.3, extraRate: 3.9, loadFee: 100, unloadFee: 100 } },
  { id: "sedan", name: "Sedan", weight: "Între 1.200 și 2.200 kg", intraRate: 5.2, extraRate: 3.6, mid: { intraRate: 4.5, unloadFee: 70 }, short: { intraRate: 6.3, extraRate: 5.0, loadFee: 100, unloadFee: 100 } },
  { id: "suv", name: "SUV", weight: "Între 1.500 și 2.500 kg", intraRate: 7.3, extraRate: 5.4, mid: { intraRate: 6.3, unloadFee: 80 }, short: { intraRate: 8.8, extraRate: 7.6, loadFee: 120, unloadFee: 120 } },
  { id: "microbuz", name: "Microbuz", weight: "Între 2.000 și 3.500 kg, 16–24 locuri", intraRate: 10.3, extraRate: 7.5, mid: { intraRate: 8.9, unloadFee: 130 }, short: { intraRate: 12.5, extraRate: 10.5, loadFee: 200, unloadFee: 200 } },
  { id: "duba", name: "Autoutilitară", weight: "Între 3.000 și 7.500 kg", intraRate: 10.5, extraRate: 12.0, mid: { intraRate: 9.0, unloadFee: 130 }, short: { intraRate: 12.6, extraRate: 16.8, loadFee: 200, unloadFee: 200 } },
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
  /**
   * ASSUMPTION (to confirm): up to SHORT_MAX_KM the short tariff applies (all km at the urban
   * Intra rate + load/unload fees). Where the reference switches is unknown — simulations at
   * ~20, 30, 40 and 70 km settle it.
   */
  shortMaxKm: 30,
  /** Km billed at the Extra-City rate on a mid trip (the reference showed 1 km on a 70 km route). */
  midExtraKm: 1,
  freeWaitMinutes: 30,
  waitPerHour: 100,
  /** Surcharge per locked wheel (reference asks 1–4) — not visible in the screenshots yet. */
  lockedWheelFee: null as number | null,
  maxKm: 3000,
};

export const DOCUMENTS = [
  { title: "Certificatul de înmatriculare (talonul)" },
  { title: "Factura de achiziție", note: "Pentru mașinile cumpărate de la dealeri sau parcuri auto." },
  { title: "Actul de identitate" },
  { title: "Nota de comandă" },
];

export const byId = (id: string) => VEHICLES.find((v) => v.id === id);

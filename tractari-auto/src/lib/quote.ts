import { PRICING, type Vehicle } from "@/config/pricing";

export type Quote = {
  km: number;
  /** "short" = urban tariff + fees; "mid" = regional tariff + fees; "long" = distance tariff */
  band: "short" | "mid" | "long";
  intraKm: number;
  extraKm: number;
  intraRate: number;
  extraRate: number;
  loadFee: number;
  unloadFee: number;
  /** "Reducere cursă lungă", taken off the unload fee on mid trips (before the coefficient) */
  discount: number;
  subtotal: number;
  /** true when the long-trip price was raised so a longer trip is never cheaper than a shorter one */
  floorApplied: boolean;
  total: number;
  hours: number;
  lockedWheels: number;
  /** trolley handling fee for locked wheels, before the coefficient */
  wheelsFee: number;
  wheelsPending: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function raw(vehicle: Vehicle, km: number, lockedWheels: number) {
  const wheels = lockedWheels * (PRICING.lockedWheelFee ?? 0);
  if (km <= PRICING.shortMaxKm) {
    const s = vehicle.short;
    const subtotal = s.loadFee + s.unloadFee + km * s.intraRate + wheels;
    return { band: "short" as const, intraKm: km, extraKm: 0, intraRate: s.intraRate, extraRate: s.extraRate, loadFee: s.loadFee, unloadFee: s.unloadFee, discount: 0, subtotal };
  }
  const mExtra = Math.min(km, PRICING.midExtraKm);
  const mid = { band: "mid" as const, intraKm: km - mExtra, extraKm: mExtra, intraRate: vehicle.mid.intraRate, extraRate: vehicle.extraRate, loadFee: vehicle.short.loadFee, unloadFee: vehicle.short.unloadFee, discount: vehicle.mid.unloadDiscount, subtotal: 0 };
  mid.subtotal = mid.loadFee + mid.unloadFee - mid.discount + mid.intraKm * mid.intraRate + mid.extraKm * mid.extraRate + wheels;
  const extraKm = Math.min(km, PRICING.extraKm);
  const intraKm = km - extraKm;
  const subtotal = intraKm * vehicle.intraRate + extraKm * vehicle.extraRate + wheels;
  const long = { band: "long" as const, intraKm, extraKm, intraRate: vehicle.intraRate, extraRate: vehicle.extraRate, loadFee: 0, unloadFee: 0, discount: 0, subtotal };
  // Modelled as the higher of the two (fits all three reference routes): fees dominate on regional trips, the long tariff past ~200–360 km.
  return mid.subtotal >= long.subtotal ? mid : long;
}

/** Pure pricing function — the only place the formula lives (unit-tested). */
export function quote(vehicle: Vehicle, kmRaw: number, opts: { lockedWheels?: number; hours?: number } = {}): Quote {
  const km = Math.max(0, Math.min(PRICING.maxKm, Math.round(kmRaw * 100) / 100));
  const lockedWheels = Math.max(0, Math.min(4, Math.round(opts.lockedWheels ?? 0)));
  const r = raw(vehicle, km, lockedWheels);
  let total = km > 0 ? r.subtotal * PRICING.multiplier : 0;
  // Interim rule until the band boundary is confirmed: a longer trip never costs less than the
  // longest short trip (otherwise the price would drop sharply just past SHORT_MAX_KM).
  const floor = r.band !== "short" ? raw(vehicle, PRICING.shortMaxKm, lockedWheels).subtotal * PRICING.multiplier : 0;
  const floorApplied = total < floor;
  if (floorApplied) total = floor;
  return {
    km,
    ...r,
    intraKm: round2(r.intraKm),
    subtotal: round2(r.subtotal),
    floorApplied,
    total: round2(total),
    hours: opts.hours ?? km / PRICING.avgSpeedKmh,
    lockedWheels,
    wheelsFee: lockedWheels * (PRICING.lockedWheelFee ?? 0),
    wheelsPending: lockedWheels > 0 && PRICING.lockedWheelFee == null,
  };
}

const lei = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatLei = (n: number) => `${lei.format(n)} lei`;
export const formatRate = (n: number) => n.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatKm = (km: number) => `${km.toLocaleString("ro-RO", { maximumFractionDigits: 1 })} km`;
export function formatHours(h: number) {
  if (h <= 0) return "—";
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60), mm = total % 60;
  return hh ? `${hh} h ${mm.toString().padStart(2, "0")} min` : `${mm} min`;
}

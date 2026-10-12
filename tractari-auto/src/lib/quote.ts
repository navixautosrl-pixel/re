import { PRICING, type Vehicle } from "@/config/pricing";

export type Quote = {
  km: number;
  intraKm: number;
  extraKm: number;
  intraCost: number;
  extraCost: number;
  subtotal: number;
  /** null when a surcharge applies that isn't priced yet (damaged vehicle) */
  total: number;
  hours: number;
  damagedPending: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Pure pricing function — the only place the formula lives (unit-tested). */
export function quote(vehicle: Vehicle, kmRaw: number, opts: { damaged?: boolean; hours?: number } = {}): Quote {
  const km = Math.max(0, Math.min(PRICING.maxKm, Math.round(kmRaw)));
  const extraKm = Math.min(km, PRICING.extraKm);
  const intraKm = km - extraKm;
  const intraCost = intraKm * vehicle.intraRate;
  const extraCost = extraKm * vehicle.extraRate;
  const subtotal = intraCost + extraCost;
  const damagedFactor = opts.damaged && PRICING.damagedMultiplier ? PRICING.damagedMultiplier : 1;
  return {
    km,
    intraKm,
    extraKm,
    intraCost: round2(intraCost),
    extraCost: round2(extraCost),
    subtotal: round2(subtotal),
    total: round2(subtotal * PRICING.multiplier * damagedFactor),
    hours: opts.hours ?? km / PRICING.avgSpeedKmh,
    damagedPending: !!opts.damaged && PRICING.damagedMultiplier == null,
  };
}

const lei = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatLei = (n: number) => `${lei.format(n)} lei`;
export const formatRate = (n: number) => n.toLocaleString("ro-RO", { minimumFractionDigits: 1 });
export function formatHours(h: number) {
  if (h <= 0) return "—";
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60), mm = total % 60;
  return hh ? `${hh} h ${mm.toString().padStart(2, "0")} min` : `${mm} min`;
}

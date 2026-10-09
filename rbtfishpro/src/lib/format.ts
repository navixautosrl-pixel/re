import { site } from "@/config/site";

const money = new Intl.NumberFormat(site.locale, { style: "currency", currency: site.currency, minimumFractionDigits: 2 });

/** Formats an amount in bani (1/100 RON) — all totals are integer bani to avoid float drift. */
export const formatBani = (bani: number) => money.format(bani / 100);
export const toBani = (lei: number) => Math.round(lei * 100);

import { test, expect } from "@playwright/test";
import { VEHICLES, PRICING } from "../src/config/pricing";
import { quote } from "../src/lib/quote";

// Reference: six simulations of bursatractari.ro/calculator, București → Cluj-Napoca, 457 km
// (427 km "Intra-City" + 30 km "Extra-City"), screenshots supplied by the client.
const REFERENCE: Record<string, number> = { moto: 1823.34, hatchback: 2462.45, sedan: 2926.75, suv: 4110.99, microbuz: 5802.75, duba: 6034.05 };

test("same split as the reference: 457 km → 427 + 30", () => {
  const q = quote(VEHICLES[1], 457);
  expect([q.intraKm, q.extraKm]).toEqual([427, 30]);
});

for (const v of VEHICLES) {
  test(`${v.name}: within 1.5 % of the reference total`, () => {
    const q = quote(v, 457);
    expect(q.total).toBeCloseTo(PRICING.multiplier * (427 * v.intraRate + 30 * v.extraRate), 1);
    const diff = Math.abs(q.total / REFERENCE[v.id] - 1);
    expect(diff).toBeLessThan(0.015);
  });
}

test("short trips use only the first-km rate; bounds are clamped", () => {
  const hb = VEHICLES.find((v) => v.id === "hatchback")!;
  expect(quote(hb, 10)).toMatchObject({ intraKm: 0, extraKm: 10, total: 35 }); // 10 × 2.8 × 1.25
  expect(quote(hb, 0).total).toBe(0);
  expect(quote(hb, 999999).km).toBe(PRICING.maxKm);
});

test("damaged vehicle: surcharge flagged as pending while unpriced", () => {
  const q = quote(VEHICLES[0], 100, { damaged: true });
  expect(q.damagedPending).toBe(PRICING.damagedMultiplier == null);
});

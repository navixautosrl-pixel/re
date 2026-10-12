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

// Short trips: Militari → Drumul Taberei (3 km), screenshots supplied by the client.
test("short trip: urban rate + load/unload fees, motorcycle matches the reference 239,82 lei", () => {
  const moto = VEHICLES.find((v) => v.id === "moto")!;
  const q = quote(moto, 3);
  expect(q).toMatchObject({ band: "short", intraKm: 3, extraKm: 0, intraRate: 3.9, loadFee: 90, unloadFee: 90 });
  expect(Math.abs(q.total / 239.82 - 1)).toBeLessThan(0.002);
  const sedan = VEHICLES.find((v) => v.id === "sedan")!;
  expect(quote(sedan, 3).total).toBeCloseTo(1.25 * (200 + 3 * 6.3), 2);
});

test("a longer trip is never cheaper than the longest short trip; bounds are clamped", () => {
  const hb = VEHICLES.find((v) => v.id === "hatchback")!;
  for (let km = PRICING.shortMaxKm; km < 200; km++) expect(quote(hb, km + 1).total).toBeGreaterThanOrEqual(quote(hb, km).total);
  expect(quote(hb, 0).total).toBe(0);
  expect(quote(hb, 999999).km).toBe(PRICING.maxKm);
});

test("locked wheels: surcharge flagged as pending while unpriced", () => {
  const q = quote(VEHICLES[0], 100, { lockedWheels: 2 });
  expect(q.wheelsPending).toBe(PRICING.lockedWheelFee == null);
});

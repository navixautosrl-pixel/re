import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { fieldErrors, orderSchema } from "@/lib/schemas";
import { priceCart } from "@/lib/pricing";
import { formatBani } from "@/lib/format";
import { deliver, sinkFor } from "@/lib/server/deliver";
import { allow, sameOrigin } from "@/lib/server/rate-limit";

const json = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json(403, { ok: false, error: "bad_origin" });
  if (!allow("order", req)) return json(429, { ok: false, error: "rate_limited" });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return json(422, { ok: false, error: "validation", fields: fieldErrors(parsed.error) });
  const o = parsed.data;
  if (o.website) return json(200, { ok: true, orderId: null }); // honeypot: drop silently

  // Never take an order at a price the business hasn't confirmed, unless explicitly testing.
  if (!site.catalog.pricesConfirmed && process.env.ALLOW_PLACEHOLDER_ORDERS !== "true")
    return json(503, { ok: false, error: "catalog_unconfirmed" });
  if (!sinkFor("orders")) return json(503, { ok: false, error: "orders_not_configured" });

  const cart = priceCart(o.items);
  if (!cart.lines.length) return json(422, { ok: false, error: "validation", fields: { items: "Produsele din coș nu mai sunt disponibile." } });

  const now = new Date();
  const orderId = `RBT-${now.toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const payment = site.payment.methods.find((m) => m.id === o.payment)!;
  const record = {
    orderId,
    createdAt: now.toISOString(),
    pricesConfirmed: site.catalog.pricesConfirmed,
    customer: { name: o.name, phone: o.phone, email: o.email, county: o.county, city: o.city, address: o.address, postalCode: o.postalCode },
    notes: o.notes,
    payment: payment.id,
    lines: cart.lines.map((l) => ({ slug: l.slug, name: l.product.name, diameter: l.diameter, qty: l.qty, unitBani: l.unit, totalBani: l.total })),
    subtotalBani: cart.subtotal,
    shippingBani: cart.shipping,
    totalBani: cart.total,
  };
  const text = [
    `Comandă nouă ${orderId}${site.catalog.pricesConfirmed ? "" : " — ATENȚIE: prețuri exemplu, neconfirmate"}`,
    "",
    ...cart.lines.map((l) => `${l.qty} × ${l.product.name} ${l.diameter} mm — ${formatBani(l.total)}`),
    "",
    `Subtotal: ${formatBani(cart.subtotal)}`,
    `Livrare: ${cart.shipping == null ? "de confirmat" : formatBani(cart.shipping)}`,
    `Total: ${formatBani(cart.total)}`,
    `Plată: ${payment.label}`,
    "",
    `${o.name} · ${o.phone} · ${o.email}`,
    `${o.address}, ${o.city}, jud. ${o.county} ${o.postalCode}`,
    o.notes ? `Observații: ${o.notes}` : "",
  ].join("\n");

  try {
    await deliver("orders", record, { subject: `Comandă ${orderId}`, text, replyTo: o.email });
  } catch (e) {
    console.error("[orders] delivery failed", e instanceof Error ? e.message : e);
    return json(502, { ok: false, error: "delivery_failed" });
  }
  return json(200, {
    ok: true,
    orderId,
    summary: { lines: record.lines, subtotalBani: cart.subtotal, shippingBani: cart.shipping, totalBani: cart.total, payment: payment.label },
  });
}

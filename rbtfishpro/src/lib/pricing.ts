import { site } from "@/config/site";
import { bySlug, type Diameter, type Product } from "@/data/products";

export const MAX_QTY = 20;
export const MAX_LINES = 16;

export type CartLine = { slug: string; diameter: Diameter; qty: number };
export type PricedLine = CartLine & { product: Product; unit: number; total: number };

/**
 * The single source of truth for cart maths, shared by the cart UI and the order API.
 * The server never trusts a price from the client: it calls this with the slugs/quantities only.
 */
export function priceCart(lines: CartLine[]) {
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const product = bySlug(l.slug);
    if (!product || !product.diameters.includes(l.diameter)) continue;
    const unit = Math.round(product.price * 100);
    priced.push({ ...l, product, unit, total: unit * l.qty });
  }
  const subtotal = priced.reduce((s, l) => s + l.total, 0);
  const count = priced.reduce((s, l) => s + l.qty, 0);
  const { flatFee, freeOver } = site.shipping;
  // Shipping is only added when the business has confirmed a fee; otherwise it is "to be confirmed".
  const shipping =
    flatFee == null ? null : freeOver != null && subtotal >= Math.round(freeOver * 100) ? 0 : Math.round(flatFee * 100);
  return { lines: priced, count, subtotal, shipping, total: subtotal + (shipping ?? 0) };
}

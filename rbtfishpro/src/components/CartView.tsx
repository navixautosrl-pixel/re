"use client";

import Link from "next/link";
import { cart, useCart, useHydrated } from "@/lib/cart";
import { priceCart, MAX_QTY } from "@/lib/pricing";
import { formatBani } from "@/lib/format";
import { site } from "@/config/site";
import { BagImage } from "@/components/Picture";
import { t } from "@/i18n/ro";

export function Totals({ subtotal, shipping, total, compact }: { subtotal: number; shipping: number | null; total: number; compact?: boolean }) {
  return (
    <dl className={`tabular space-y-2 ${compact ? "" : "text-[length:var(--step-1)]"}`}>
      <div className="flex justify-between gap-4"><dt className="text-mist-2">{t.cart.subtotal}</dt><dd>{formatBani(subtotal)}</dd></div>
      <div className="flex justify-between gap-4">
        <dt className="text-mist-2">{t.cart.shipping}</dt>
        <dd className="text-right">{shipping == null ? <span className="text-lamp">{t.cart.shippingTbc}</span> : shipping === 0 ? "gratuită" : formatBani(shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-white/15 pt-3 font-semibold">
        <dt>{shipping == null ? "Total produse" : t.cart.total}</dt>
        <dd>{formatBani(total)}</dd>
      </div>
      {!site.catalog.pricesConfirmed && <p className="pt-1 text-[length:var(--step--1)] text-lamp">Prețurile sunt exemple, încă neconfirmate de RbtFishPro.</p>}
    </dl>
  );
}

export function CartView() {
  const lines = useCart();
  const hydrated = useHydrated();
  const { lines: priced, subtotal, shipping, total, count } = priceCart(lines);

  if (!hydrated) return <div className="min-h-[24rem]" aria-busy="true" />;

  if (!priced.length)
    return (
      <div className="rounded-[var(--radius-panel)] border border-dashed border-white/20 px-6 py-16 text-center">
        <p className="display-2 text-[length:var(--step-2)]">{t.cart.empty}</p>
        <p className="mt-2 text-mist-2">{t.cart.emptyHint}</p>
        <Link href="/magazin" className="btn btn-primary mt-8">Mergi la magazin</Link>
      </div>
    );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
      <section aria-labelledby="cart-items">
        <h2 id="cart-items" className="sr-only">Produse în coș</h2>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {priced.map((l) => (
            <li key={`${l.slug}-${l.diameter}`} className="grid grid-cols-[4.5rem_1fr] gap-4 py-5 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center">
              <div className="grid aspect-[4/5] place-items-center rounded-[var(--radius-btn)] bg-reed/60 p-1.5">
                <BagImage base={l.product.image.base} width={l.product.image.width} height={l.product.image.height} alt="" className="h-full w-auto" />
              </div>
              <div>
                <Link href={`/produse/${l.slug}`} className="display-2 text-[1.45rem] hover:text-cyan-2">{l.product.name}</Link>
                <p className="text-mist-2">{l.diameter} mm · {formatBani(l.unit)} / pungă</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex h-11 items-stretch overflow-hidden rounded-[var(--radius-btn)] border-[1.5px] border-white/25" role="group" aria-label={`${t.product.quantity}: ${l.product.name} ${l.diameter} mm`}>
                    <button type="button" className="w-11 text-lg hover:bg-white/5 disabled:opacity-40" disabled={l.qty <= 1} onClick={() => cart.setQty(l.slug, l.diameter, l.qty - 1)} aria-label={t.cart.decrease}>−</button>
                    <span className="tabular grid w-11 place-items-center border-x-[1.5px] border-white/25" aria-live="polite">{l.qty}</span>
                    <button type="button" className="w-11 text-lg hover:bg-white/5 disabled:opacity-40" disabled={l.qty >= MAX_QTY} onClick={() => cart.setQty(l.slug, l.diameter, l.qty + 1)} aria-label={t.cart.increase}>+</button>
                  </div>
                  <button type="button" className="link min-h-11 px-1 text-mist-2" onClick={() => cart.remove(l.slug, l.diameter)}>
                    {t.cart.remove}<span className="sr-only"> {l.product.name} {l.diameter} mm</span>
                  </button>
                </div>
              </div>
              <p className="tabular col-start-2 font-semibold sm:col-start-3 sm:text-right">{formatBani(l.total)}</p>
            </li>
          ))}
        </ul>
        <Link href="/magazin" className="link mt-6 inline-block">{t.cart.continue}</Link>
      </section>

      <aside aria-labelledby="summary" className="rounded-[var(--radius-panel)] bg-night-2 p-6 lg:sticky lg:top-24">
        <h2 id="summary" className="display-2 text-[length:var(--step-2)]">Sumar</h2>
        <p className="mt-1 text-mist-2">{count === 1 ? "1 pungă" : `${count} pungi`}</p>
        <div className="mt-5"><Totals subtotal={subtotal} shipping={shipping} total={total} /></div>
        <Link href="/finalizare-comanda" className="btn btn-primary mt-6 w-full">{t.cart.checkout}</Link>
        <p className="mt-4 text-[length:var(--step--1)] text-mist-2">
          Plata: {site.payment.methods.map((m) => m.label.toLowerCase()).join(" sau ")}
          {site.payment.methods.some((m) => !m.confirmed) ? " (metode încă neconfirmate)" : ""}. Plata cu cardul nu este disponibilă online.
        </p>
      </aside>
    </div>
  );
}

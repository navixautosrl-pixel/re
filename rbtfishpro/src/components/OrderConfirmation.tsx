"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { formatBani } from "@/lib/format";
import { LAST_ORDER_KEY } from "@/lib/cart";
import { Totals } from "@/components/CartView";

type Summary = {
  orderId: string;
  email?: string;
  summary?: { lines: { name: string; diameter: number; qty: number; totalBani: number }[]; subtotalBani: number; shippingBani: number | null; totalBani: number; payment: string };
};

const read = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};

export function OrderConfirmation() {
  const raw = useSyncExternalStore(() => () => {}, read, () => undefined);
  if (raw === undefined) return <div className="min-h-[20rem]" aria-busy="true" />;
  let order: Summary | null = null;
  try {
    order = raw ? (JSON.parse(raw) as Summary) : null;
  } catch {
    order = null;
  }

  if (!order?.orderId)
    return (
      <div>
        <h1 className="display text-[length:var(--step-4)]">Nicio comandă recentă</h1>
        <p className="mt-4 text-mist-2">Nu găsim o comandă trimisă din această fereastră a browserului.</p>
        <Link href="/magazin" className="btn btn-primary mt-8">Mergi la magazin</Link>
      </div>
    );

  const s = order.summary;
  return (
    <div>
      <p className="font-semibold text-ok">Comanda a fost trimisă</p>
      <h1 className="display mt-2 text-[length:var(--step-4)]">Mulțumim!</h1>
      <p className="mt-4 text-[length:var(--step-1)]">
        Numărul comenzii: <strong className="tabular text-cyan">{order.orderId}</strong>
      </p>
      <p className="measure mt-4 text-mist-2">
        Comanda a ajuns la RbtFishPro. Urmează confirmarea ei — inclusiv costul livrării și plata — prin telefon sau e-mail{order.email ? ` (${order.email})` : ""}. Păstrează numărul comenzii pentru orice întrebare.
      </p>
      {s && (
        <section aria-labelledby="ord-sum" className="mt-10 max-w-xl rounded-[var(--radius-panel)] bg-night-2 p-6">
          <h2 id="ord-sum" className="display-2 text-[length:var(--step-2)]">Ce ai comandat</h2>
          <ul className="mt-4 space-y-2">
            {s.lines.map((l) => (
              <li key={`${l.name}-${l.diameter}`} className="flex justify-between gap-4">
                <span>{l.qty} × {l.name}, {l.diameter} mm</span>
                <span className="tabular">{formatBani(l.totalBani)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-white/10 pt-5"><Totals compact subtotal={s.subtotalBani} shipping={s.shippingBani} total={s.totalBani} /></div>
          <p className="mt-4 text-mist-2">Plată: {s.payment}</p>
        </section>
      )}
      <Link href="/magazin" className="btn btn-ghost mt-10">Înapoi la magazin</Link>
    </div>
  );
}

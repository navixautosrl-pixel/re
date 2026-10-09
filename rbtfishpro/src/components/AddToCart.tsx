"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cart } from "@/lib/cart";
import { MAX_QTY } from "@/lib/pricing";
import type { Diameter, Product } from "@/data/products";
import { t } from "@/i18n/ro";

/**
 * Variant (diameter) + quantity + add. The diameter options are drawn as circles
 * in true proportion to each other (20 vs 24 mm), so the choice is visible, not just a number.
 */
export function AddToCart({ product }: { product: Pick<Product, "slug" | "name" | "diameters"> }) {
  const [diameter, setDiameter] = useState<Diameter>(product.diameters[0]);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const id = useId();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function add() {
    const inCart = cart.add(product.slug, diameter, qty);
    setStatus(
      inCart
        ? `${t.product.added}: ${qty} × ${product.name}, ${diameter} mm.${inCart === MAX_QTY ? ` Maximum ${MAX_QTY} pungi pe produs.` : ""}`
        : "Coșul are deja numărul maxim de produse diferite.",
    );
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(""), 6000);
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <fieldset>
        <legend className="field-label">{t.product.diameter}</legend>
        <div className="flex flex-wrap gap-3">
          {product.diameters.map((d) => (
            <label
              key={d}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius-btn)] border-[1.5px] border-white/25 px-4 transition-colors hover:border-mist-2 has-checked:border-cyan has-checked:bg-cyan/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-cyan"
            >
              <input type="radio" name={`${id}-d`} value={d} checked={diameter === d} onChange={() => setDiameter(d)} className="sr-only" />
              <span aria-hidden="true" className="grid w-7 place-items-center">
                <span className="block rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--lamp),oklch(52%_0.08_60))]" style={{ width: d * 1.1, height: d * 1.1 }} />
              </span>
              <span className="tabular font-semibold">{d} mm</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor={`${id}-q`} className="field-label">{t.product.quantity}</label>
          <div className="flex h-12 items-stretch overflow-hidden rounded-[var(--radius-btn)] border-[1.5px] border-white/25">
            <button type="button" className="w-12 text-xl hover:bg-white/5 disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.cart.decrease}>−</button>
            <input
              id={`${id}-q`}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_QTY}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(MAX_QTY, Number(e.target.value) || 1)))}
              className="tabular w-14 border-x-[1.5px] border-white/25 bg-transparent text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" className="w-12 text-xl hover:bg-white/5 disabled:opacity-40" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label={t.cart.increase}>+</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary flex-1 sm:flex-none sm:min-w-[14rem]">
          {t.product.add}
        </button>
      </div>

      <p role="status" aria-live="polite" className="min-h-6 text-ok">
        {status && (
          <>
            {status}{" "}
            <Link href="/cos" className="link font-semibold">Vezi coșul</Link>
          </>
        )}
      </p>
    </form>
  );
}

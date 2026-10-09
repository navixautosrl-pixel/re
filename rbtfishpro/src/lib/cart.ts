"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { cartLineSchema } from "@/lib/schemas";
import { MAX_LINES, MAX_QTY, type CartLine } from "@/lib/pricing";
import { bySlug, type Diameter } from "@/data/products";

/**
 * Persistent cart: localStorage, validated on read (a stale or tampered entry is dropped,
 * never trusted), synced across tabs via the `storage` event. Prices are never stored —
 * they're always recomputed from the catalogue (src/lib/pricing.ts).
 */
const KEY = "rbtfishpro.cart.v1";
/** The last order summary (sessionStorage) shown on /comanda-trimisa. */
export const LAST_ORDER_KEY = "rbtfishpro.lastOrder";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = z.array(cartLineSchema).safeParse(JSON.parse(raw));
    if (!parsed.success) return EMPTY;
    return parsed.data.filter((l) => bySlug(l.slug)?.diameters.includes(l.diameter)).slice(0, MAX_LINES);
  } catch {
    return EMPTY;
  }
}

function write(next: CartLine[]) {
  cache = next;
  try {
    if (next.length) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* private mode / storage full: the cart still works for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => (cache ??= read());
const getServerSnapshot = () => EMPTY;

const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)));
const same = (l: CartLine, slug: string, d: Diameter) => l.slug === slug && l.diameter === d;

export const cart = {
  /** Returns the quantity actually in the cart for that line afterwards (capped at MAX_QTY). */
  add(slug: string, diameter: Diameter, qty = 1) {
    const lines = getSnapshot();
    const existing = lines.find((l) => same(l, slug, diameter));
    if (!existing && lines.length >= MAX_LINES) return 0;
    const nextQty = clamp((existing?.qty ?? 0) + qty);
    write(existing ? lines.map((l) => (l === existing ? { ...l, qty: nextQty } : l)) : [...lines, { slug, diameter, qty: nextQty }]);
    return nextQty;
  },
  setQty(slug: string, diameter: Diameter, qty: number) {
    write(getSnapshot().map((l) => (same(l, slug, diameter) ? { ...l, qty: clamp(qty) } : l)));
  },
  remove(slug: string, diameter: Diameter) {
    write(getSnapshot().filter((l) => !same(l, slug, diameter)));
  },
  clear() {
    write(EMPTY);
  },
};

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noop = () => () => {};
/** false during SSR and the hydration pass, true afterwards — avoids hydration mismatches. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

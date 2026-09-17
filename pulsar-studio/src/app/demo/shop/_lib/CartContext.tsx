"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../data";

type CartLine = { product: Product; qty: number };

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  function add(product: Product) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product, qty: 1 }];
    });
    setOpen(true);
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }

  function setQty(productId: string, qty: number) {
    if (qty < 1) {
      remove(productId);
      return;
    }
    setLines((prev) => prev.map((l) => (l.product.id === productId ? { ...l, qty } : l)));
  }

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.product.price, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, add, remove, setQty, count, total, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

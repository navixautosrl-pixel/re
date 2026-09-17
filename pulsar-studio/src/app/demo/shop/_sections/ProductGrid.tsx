"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { Lightbox } from "@/components/shared/Lightbox";
import { categories, products, type Category, type Product } from "../data";
import { useCart } from "../_lib/CartContext";

export function ShopProductGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>("Toate");
  const [query, setQuery] = useState("");
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { add } = useCart();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "Toate" || p.category === activeCategory;
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  function handleAdd(product: Product) {
    add(product);
    setJustAdded(product.id);
    window.setTimeout(() => setJustAdded((id) => (id === product.id ? null : id)), 1200);
  }

  return (
    <section id="produse" className="px-5 py-20 sm:px-8" style={{ background: "var(--s-bg)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    borderColor: isActive ? "var(--s-fg)" : "var(--s-border)",
                    background: isActive ? "var(--s-fg)" : "transparent",
                    color: isActive ? "var(--s-bg)" : "var(--s-muted)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--s-muted)" }} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută un produs..."
              aria-label="Caută produse"
              className="w-full rounded-full border py-2.5 pl-10 pr-4 text-sm text-[var(--s-fg)] placeholder:text-[var(--s-muted)] focus-visible:outline-none"
              style={{ borderColor: "var(--s-border)", background: "var(--s-surface)" }}
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <div className="group relative overflow-hidden rounded-lg" style={{ background: "var(--s-surface-2)" }}>
                  <button
                    type="button"
                    onClick={() => setQuickView(product)}
                    className="relative block aspect-square w-full overflow-hidden"
                    aria-label={`Vezi rapid ${product.name}`}
                  >
                    <div className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-105" style={{ background: product.color }} />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-black">
                        <Eye className="size-3.5" aria-hidden="true" />
                        Vezi rapid
                      </span>
                    </span>
                  </button>
                  <div className="p-4">
                    <p className="text-xs" style={{ color: "var(--s-muted)" }}>
                      {product.category}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-[var(--s-fg)]">{product.name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--s-fg)]">{product.price} lei</span>
                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className="flex size-10 items-center justify-center rounded-full transition-colors"
                        style={{ background: justAdded === product.id ? "var(--s-accent-2)" : "var(--s-fg)" }}
                        aria-label={`Adaugă ${product.name} în coș`}
                      >
                        {justAdded === product.id ? <Check className="size-3.5 text-white" aria-hidden="true" /> : <Plus className="size-3.5 text-white" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 ? (
          <Reveal className="py-16 text-center" style={{ color: "var(--s-muted)" }}>
            Niciun produs găsit pentru această căutare.
          </Reveal>
        ) : null}
      </div>

      <Lightbox open={!!quickView} onOpenChange={(v) => !v && setQuickView(null)}>
        {quickView ? (
          <div className="grid sm:grid-cols-2">
            <div className="aspect-square sm:aspect-auto" style={{ background: quickView.color }} />
            <div className="p-6 sm:p-8" style={{ background: "white" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--s-accent)" }}>
                {quickView.category}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-black">{quickView.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-black/60">{quickView.description}</p>
              <p className="mt-5 text-xl font-semibold text-black">{quickView.price} lei</p>
              <button
                type="button"
                onClick={() => {
                  handleAdd(quickView);
                  setQuickView(null);
                }}
                className="mt-6 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "black" }}
              >
                Adaugă în coș
              </button>
            </div>
          </div>
        ) : null}
      </Lightbox>
    </section>
  );
}

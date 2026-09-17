"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Plus, Check, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Reveal } from "@/components/shared/Reveal";
import { Lightbox } from "@/components/shared/Lightbox";
import { useDemoPortalContainer } from "@/lib/useDemoPortalContainer";
import { useCart } from "../_lib/CartContext";
import { categories, products, type Category, type Product } from "../data";

function CategoryList({ active, onSelect }: { active: Category; onSelect: (c: Category) => void }) {
  return (
    <ul className="space-y-1">
      {categories.map((cat) => {
        const isActive = cat === active;
        const count = cat === "Toate" ? products.length : products.filter((p) => p.category === cat).length;
        return (
          <li key={cat}>
            <button
              type="button"
              onClick={() => onSelect(cat)}
              aria-pressed={isActive}
              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors"
              style={{
                background: isActive ? "var(--s-surface-2)" : "transparent",
                color: isActive ? "var(--s-fg)" : "var(--s-muted)",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {cat}
              <span className="text-xs" style={{ color: "var(--s-muted)" }}>
                {count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ShopProductGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>("Toate");
  const [query, setQuery] = useState("");
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { add } = useCart();
  const container = useDemoPortalContainer();

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
    <section id="produse" className="py-20" style={{ background: "var(--s-bg)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="relative flex-1">
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
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium"
            style={{ borderColor: "var(--s-border)", color: "var(--s-fg)" }}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filtre
          </button>
        </div>

        <div className="mt-8 grid gap-10 lg:mt-0 lg:grid-cols-[220px_1fr]">
          {/* Persistent sidebar on desktop — a real layout shift from the
              other demos' top-of-content filter rows. */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative mb-6">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--s-muted)" }} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Caută..."
                  aria-label="Caută produse"
                  className="w-full rounded-full border py-2.5 pl-10 pr-4 text-sm text-[var(--s-fg)] placeholder:text-[var(--s-muted)] focus-visible:outline-none"
                  style={{ borderColor: "var(--s-border)", background: "var(--s-surface)" }}
                />
              </div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--s-muted)" }}>
                Categorii
              </p>
              <CategoryList active={activeCategory} onSelect={setActiveCategory} />
            </div>
          </aside>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <motion.div key={product.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                  <div className="group relative overflow-hidden rounded-lg" style={{ background: "var(--s-surface-2)" }}>
                    <button type="button" onClick={() => setQuickView(product)} className="relative block aspect-square w-full overflow-hidden" aria-label={`Vezi rapid ${product.name}`}>
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

            {filtered.length === 0 ? (
              <Reveal className="col-span-full py-16 text-center" style={{ color: "var(--s-muted)" }}>
                Niciun produs găsit pentru această căutare.
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet — slides up from the bottom, a different
          mechanic from the sidebar it mirrors on desktop. */}
      <Dialog.Root open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <AnimatePresence>
          {filterSheetOpen ? (
            <Dialog.Portal forceMount container={container}>
              <Dialog.Overlay asChild forceMount>
                <motion.div className="fixed inset-0 z-[95] bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-x-0 bottom-0 z-[96] rounded-t-2xl p-6"
                  style={{ background: "var(--s-bg)" }}
                >
                  <Dialog.Title className="flex items-center justify-between text-base font-semibold text-[var(--s-fg)]">
                    Filtre
                    <Dialog.Close asChild>
                      <button type="button" aria-label="Închide" className="flex size-9 items-center justify-center rounded-full">
                        <X className="size-4" style={{ color: "var(--s-fg)" }} aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </Dialog.Title>
                  <div className="mt-4">
                    <CategoryList
                      active={activeCategory}
                      onSelect={(c) => {
                        setActiveCategory(c);
                        setFilterSheetOpen(false);
                      }}
                    />
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>

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

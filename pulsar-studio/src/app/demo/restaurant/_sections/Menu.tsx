"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { menu } from "../data";

export function RestaurantMenu() {
  const [activeCategory, setActiveCategory] = useState(menu[0].id);
  const prefersReducedMotion = useReducedMotion();
  const category = menu.find((c) => c.id === activeCategory) ?? menu[0];

  return (
    <section id="meniu" className="px-5 py-24 sm:px-8 sm:py-32" style={{ background: "var(--r-surface)" }}>
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--r-accent)" }}>
            Meniu
          </p>
          <h2 className="font-restaurant mt-3 text-4xl text-[var(--r-fg)] sm:text-5xl">Ce servim</h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap justify-center gap-2">
          {menu.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isActive}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: isActive ? "var(--r-accent)" : "var(--r-border)",
                  background: isActive ? "var(--r-accent)" : "transparent",
                  color: isActive ? "var(--r-bg)" : "var(--r-muted)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </Reveal>

        <div className="mt-12 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.ul
              key={category.id}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="divide-y"
              style={{ borderColor: "var(--r-border)" }}
            >
              {category.items.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="flex items-start justify-between gap-6 border-b py-5"
                  style={{ borderColor: "var(--r-border)" }}
                >
                  <div>
                    <h3 className="font-restaurant text-lg text-[var(--r-fg)]">{item.name}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: "var(--r-muted)" }}>
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap pt-1 text-sm font-semibold" style={{ color: "var(--r-accent)" }}>
                    {item.price}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

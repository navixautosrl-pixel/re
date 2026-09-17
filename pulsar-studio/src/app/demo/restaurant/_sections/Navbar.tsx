"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, restaurant } from "../data";
import { cn } from "@/lib/utils";

/**
 * Boutique-restaurant pattern: no persistent horizontal link row at all,
 * on any screen size — just the mark, a reservation pill, and a menu
 * toggle that opens the same fullscreen overlay whether you're on a
 * phone or a 27" monitor. Deliberately not the marketing-site navbar
 * pattern the other three demos use.
 */
export function RestaurantNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn("fixed inset-x-0 top-0 z-50 border-b transition-all duration-500", scrolled || open ? "backdrop-blur-md" : "border-transparent")}
        style={{
          borderColor: scrolled || open ? "var(--r-border)" : "transparent",
          background: scrolled || open ? "color-mix(in srgb, var(--r-bg) 90%, transparent)" : "transparent",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="#acasa" className="font-restaurant text-2xl tracking-wide text-[var(--r-fg)]" onClick={() => setOpen(false)}>
            {restaurant.name}
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="#rezervare"
              className="hidden rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5 sm:inline-flex"
              style={{ background: "var(--r-accent)", color: "var(--r-bg)" }}
            >
              Rezervă o masă
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--r-fg)]"
              style={{ borderColor: "var(--r-border)" }}
              aria-label={open ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={open}
            >
              {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
              <span className="hidden sm:inline">{open ? "Închide" : "Meniu"}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center px-6 sm:px-8"
            style={{ background: "var(--r-bg)" }}
          >
            <nav className="mx-auto flex w-full max-w-xl flex-col gap-2" aria-label="Navigare principală">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b py-4"
                  style={{ borderColor: "var(--r-border)" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-restaurant flex items-center justify-between text-4xl text-[var(--r-fg)] transition-colors hover:text-[var(--r-accent)] sm:text-6xl"
                  >
                    {link.label}
                    <span className="font-sans text-sm" style={{ color: "var(--r-accent)" }}>
                      0{i + 1}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mx-auto mt-10 flex w-full max-w-xl items-center justify-between text-sm"
              style={{ color: "var(--r-muted)" }}
            >
              <span>{restaurant.phone}</span>
              <span>{restaurant.city}</span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { navLinks, shop } from "../data";
import { useCart } from "../_lib/CartContext";
import { Marquee } from "@/components/shared/Marquee";
import { cn } from "@/lib/utils";

const announcements = ["Livrare gratuită peste 300 lei", "Retur gratuit în 30 de zile", "Ambalaje reciclabile"];

export function ShopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();

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

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 py-2" style={{ background: "var(--s-fg)" }}>
        <Marquee durationSeconds={20} itemClassName="flex shrink-0 items-center gap-10 pr-10">
          {announcements.map((item) => (
            <span key={item} className="flex items-center gap-10 text-[0.7rem] font-medium uppercase tracking-wide" style={{ color: "var(--s-bg)" }}>
              {item}
              <span aria-hidden="true" style={{ color: "var(--s-accent-2)" }}>
                ·
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      <header
        className={cn("fixed inset-x-0 top-[33px] z-50 border-b transition-all duration-300", scrolled || open ? "backdrop-blur-md" : "border-transparent")}
        style={{
          borderColor: scrolled || open ? "var(--s-border)" : "transparent",
          background: scrolled || open ? "color-mix(in srgb, var(--s-bg) 92%, transparent)" : "var(--s-bg)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="#acasa" className="-my-1 py-1 text-2xl font-semibold tracking-tight text-[var(--s-fg)]" onClick={() => setOpen(false)}>
            {shop.name}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-[var(--s-muted)] transition-colors hover:text-[var(--s-fg)]">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex size-11 items-center justify-center rounded-full border transition-colors hover:border-[var(--s-accent)]"
              style={{ borderColor: "var(--s-border)" }}
              aria-label={`Coș de cumpărături, ${count} produse`}
            >
              <ShoppingBag className="size-4" style={{ color: "var(--s-fg)" }} aria-hidden="true" />
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
                  style={{ background: "var(--s-accent)" }}
                >
                  {count}
                </motion.span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex size-11 items-center justify-center rounded-full border lg:hidden"
              style={{ borderColor: "var(--s-border)" }}
              aria-label={open ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" style={{ color: "var(--s-fg)" }} aria-hidden="true" /> : <Menu className="size-5" style={{ color: "var(--s-fg)" }} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[106px] bottom-0 z-40 flex flex-col overflow-y-auto px-6 pb-8 pt-6 lg:hidden"
            style={{ background: "var(--s-bg)" }}
          >
            <nav className="flex flex-col gap-1" aria-label="Navigare mobilă">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i, duration: 0.35 }}>
                  <Link href={link.href} onClick={() => setOpen(false)} className="block border-b py-4 text-2xl text-[var(--s-fg)]" style={{ borderColor: "var(--s-border)" }}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

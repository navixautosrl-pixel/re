"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, restaurant } from "../data";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || open ? "border-b bg-[var(--r-bg)]/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        )}
        style={{ borderColor: "var(--r-border)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="#acasa" className="font-restaurant text-2xl tracking-wide text-[var(--r-fg)]" onClick={() => setOpen(false)}>
            {restaurant.name}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide text-[var(--r-muted)] transition-colors hover:text-[var(--r-accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="#rezervare"
            className="hidden rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-transform hover:-translate-y-0.5 lg:inline-flex"
            style={{ background: "var(--r-accent)", color: "var(--r-bg)" }}
          >
            Rezervă o masă
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-full border text-[var(--r-fg)] lg:hidden"
            style={{ borderColor: "var(--r-border)" }}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[72px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto px-6 pb-8 pt-6 lg:hidden"
            style={{ background: "var(--r-bg)" }}
          >
            <nav className="flex flex-col gap-1" aria-label="Navigare mobilă">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-restaurant block border-b py-4 text-3xl text-[var(--r-fg)]"
                    style={{ borderColor: "var(--r-border)" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link
              href="#rezervare"
              onClick={() => setOpen(false)}
              className="mt-8 flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold"
              style={{ background: "var(--r-accent)", color: "var(--r-bg)" }}
            >
              Rezervă o masă
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

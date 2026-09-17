"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, agency } from "../data";
import { cn } from "@/lib/utils";

export function AgencyNavbar() {
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
        className={cn("fixed inset-x-0 top-0 z-50 border-b transition-all duration-300", scrolled || open ? "backdrop-blur-md" : "border-transparent")}
        style={{
          borderColor: scrolled || open ? "var(--a-border)" : "transparent",
          background: scrolled || open ? "color-mix(in srgb, var(--a-bg) 90%, transparent)" : "transparent",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="#acasa" className="font-agency -my-2 py-2 text-xl text-[var(--a-fg)]" onClick={() => setOpen(false)}>
            {agency.name}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-[var(--a-muted)] transition-colors hover:text-[var(--a-fg)]">
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="#contact"
            className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 lg:inline-flex"
            style={{ background: "var(--a-fg)" }}
          >
            Hai să vorbim
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-full border lg:hidden"
            style={{ borderColor: "var(--a-border)" }}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" style={{ color: "var(--a-fg)" }} aria-hidden="true" /> : <Menu className="size-5" style={{ color: "var(--a-fg)" }} aria-hidden="true" />}
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
            className="fixed inset-x-0 top-[76px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto px-6 pb-8 pt-6 lg:hidden"
            style={{ background: "var(--a-bg)" }}
          >
            <nav className="flex flex-col gap-1" aria-label="Navigare mobilă">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i, duration: 0.35 }}>
                  <Link href={link.href} onClick={() => setOpen(false)} className="font-agency block border-b py-4 text-2xl text-[var(--a-fg)]" style={{ borderColor: "var(--a-border)" }}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-8 flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold text-white"
              style={{ background: "var(--a-fg)" }}
            >
              Hai să vorbim
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, gym } from "../data";
import { Marquee } from "@/components/shared/Marquee";
import { cn } from "@/lib/utils";

const tickerItems = ["Abonament anual −20%", "Clase noi de box", "Prima ședință e gratuită", "Deschis 7 zile din 7"];

export function FitnessNavbar() {
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
          "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
          scrolled || open ? "backdrop-blur-md" : "border-transparent bg-transparent"
        )}
        style={{
          borderColor: scrolled || open ? "var(--f-border)" : "transparent",
          background: scrolled || open ? "rgba(10,10,10,0.9)" : "transparent",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="#acasa" className="font-fitness text-2xl tracking-wide text-[var(--f-fg)]" onClick={() => setOpen(false)}>
            {gym.name}
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold uppercase tracking-wide text-[var(--f-muted)] transition-colors hover:text-[var(--f-accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="#abonamente"
            className="hidden rounded-md px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5 lg:inline-flex"
            style={{ background: "var(--f-accent)", color: "#0a0a0a" }}
          >
            Începe acum
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-md border text-[var(--f-fg)] lg:hidden"
            style={{ borderColor: "var(--f-border)" }}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Persistent ticker strip — a fixture none of the other demos have,
          always visible (not just on scroll) to read as "always live". */}
      <div className="fixed inset-x-0 top-[65px] z-40 border-b py-2 sm:top-[73px]" style={{ background: "var(--f-accent)", borderColor: "var(--f-accent)" }}>
        <Marquee durationSeconds={18} itemClassName="flex shrink-0 items-center gap-10 pr-10">
          {tickerItems.map((item) => (
            <span key={item} className="flex items-center gap-10 text-xs font-bold uppercase tracking-wide" style={{ color: "#0a0a0a" }}>
              {item}
              <span aria-hidden="true">●</span>
            </span>
          ))}
        </Marquee>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[105px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto px-6 pb-8 pt-6 lg:hidden"
            style={{ background: "var(--f-bg)" }}
          >
            <nav className="flex flex-col gap-1" aria-label="Navigare mobilă">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-fitness block border-b py-4 text-3xl uppercase text-[var(--f-fg)]"
                    style={{ borderColor: "var(--f-border)" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link
              href="#abonamente"
              onClick={() => setOpen(false)}
              className="mt-8 flex items-center justify-center rounded-md px-6 py-4 text-sm font-bold uppercase"
              style={{ background: "var(--f-accent)", color: "#0a0a0a" }}
            >
              Începe acum
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

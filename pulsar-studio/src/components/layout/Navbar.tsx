"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
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
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-premium)]",
          scrolled || open ? "glass border-b" : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="container-max flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href="#acasa" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="flex size-8 items-center justify-center rounded-md bg-[image:var(--gradient-blue-purple)] font-display text-sm font-bold text-white">
              P
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">{siteConfig.name}</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[image:var(--gradient-blue-cyan)] transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <Link
              href="#contact"
              className="inline-flex items-center rounded-full bg-[image:var(--gradient-blue-purple)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_-6px_color-mix(in_srgb,var(--color-accent-3)_60%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-6px_color-mix(in_srgb,var(--color-accent-3)_75%,transparent)]"
            >
              Cere o ofertă
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="glass flex size-11 items-center justify-center rounded-full text-foreground lg:hidden"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Sibling of <header>, not a child — the header carries backdrop-blur
          once scrolled/open, which would otherwise establish a new
          containing block for this panel's fixed top/bottom anchoring. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[72px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto bg-background px-6 pb-8 pt-6 lg:hidden"
          >
            <div className="gradient-mesh opacity-40" aria-hidden="true" />
            <nav className="relative flex flex-col gap-1" aria-label="Navigare mobilă">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display block border-b border-border py-4 text-4xl font-medium text-foreground transition-colors hover:text-accent-2 active:text-accent-2"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="relative mt-8">
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-[image:var(--gradient-blue-purple)] px-6 py-4 text-sm font-semibold text-white"
              >
                Cere o ofertă
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

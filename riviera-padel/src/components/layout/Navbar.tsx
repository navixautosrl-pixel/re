"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
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

  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-premium)]",
          scrolled || open
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="container-max flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href="#acasa" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
            <span className="font-display text-2xl uppercase tracking-tight text-foreground">
              {siteConfig.name}
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Padel Lounge &amp; Sports
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-1 text-sm font-medium uppercase tracking-[0.06em] text-foreground/80 transition-colors hover:text-accent"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <a
              href={siteConfig.phoneHref}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              {siteConfig.phoneDisplay}
            </a>
            <a
              href={bookingHref}
              className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.06em] text-accent-foreground transition-colors hover:bg-foreground"
            >
              Rezervă
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-sm border border-border-strong text-foreground lg:hidden"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Rendered as a sibling of <header>, not a child — the header can
          carry backdrop-blur, which establishes a new containing block for
          `position: fixed` descendants and would otherwise collapse this
          panel's top/bottom-anchored height to the header's own box. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[72px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto bg-background px-6 pb-8 pt-6 lg:hidden"
          >
            <nav className="flex flex-col gap-1" aria-label="Navigare mobilă">
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
                    className="font-display block border-b border-border py-4 text-4xl uppercase leading-none text-foreground transition-colors hover:text-accent active:text-accent"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-4">
              <a
                href={siteConfig.phoneHref}
                className="flex items-center gap-3 text-base font-medium text-foreground"
              >
                <Phone className="size-4 text-accent" aria-hidden="true" />
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={bookingHref}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-sm bg-accent px-6 py-4 text-sm font-semibold uppercase tracking-[0.06em] text-accent-foreground"
              >
                Rezervă un teren
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

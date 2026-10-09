"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";

const NAV = [
  { href: "#tools", label: "Tools" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#gaps", label: "Missing tools" },
  { href: "#use", label: "Use it" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Header rule appears once the hero's top edge leaves the viewport (no scroll listener).
  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    if (!sentinel) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-200 border-b ${
        scrolled ? "bg-ground/95 border-line backdrop-blur-[2px]" : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-[min(100%-2rem,76rem)] items-center justify-between">
        <a href="#main" className="flex items-center gap-2.5 font-bold" aria-label="Skill Atelier, back to top">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="7" r="2.4" fill="currentColor" />
            <path d="M16 9v4M10 13h12l-2 13h-8z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <rect x="11.5" y="17" width="9" height="4" className="fill-signal" />
          </svg>
          <span className="stamp text-[1.15rem]">Skill Atelier</span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[0.95rem]">
            {NAV.map((n) => (
              <li key={n.href}>
                <a className="underline-offset-[6px] decoration-2 hover:underline" href={n.href}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="md:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" stroke="currentColor" strokeWidth="2" fill="none">
            {open ? <path d="M4 4l14 14M18 4L4 18" /> : <path d="M2 6h18M2 11h18M2 16h12" />}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            key="mobile-nav"
            id={menuId}
            aria-label="Primary"
            className="md:hidden absolute inset-x-0 top-full border-y border-line bg-ground shadow-[0_12px_24px_-12px_oklch(20%_0.04_260/0.25)]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24 }}
          >
            <ul className="mx-auto w-[min(100%-2rem,76rem)] py-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a className="block py-3 text-lg" href={n.href} onClick={() => setOpen(false)}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

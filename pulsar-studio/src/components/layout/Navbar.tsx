"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, siteConfig } from "@/lib/constants";
import { useSectionHref } from "@/lib/useSectionHref";
import { cn } from "@/lib/utils";

export function Navbar() {
  const sectionHref = useSectionHref();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

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
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-premium)]",
          scrolled || open ? "glass-header border-b border-border" : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="container-max flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href={sectionHref("#acasa")} className="-my-1 flex items-center gap-2.5 py-1" onClick={() => setOpen(false)}>
            <span className="flex size-8 items-center justify-center rounded-md bg-[image:var(--gradient-blue-purple)] font-display text-sm font-bold text-white">
              P
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">{siteConfig.name}</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigare principală">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <Link
                  key={link.href}
                  href={sectionHref(link.href)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group relative py-1 text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-foreground/70"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-[image:var(--gradient-blue-cyan)] transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100",
                      isActive ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex">
            <Link
              href={sectionHref("#contact")}
              className="inline-flex items-center rounded-full bg-[image:var(--gradient-blue-purple)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_-6px_color-mix(in_srgb,var(--color-accent-3)_60%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-6px_color-mix(in_srgb,var(--color-accent-3)_75%,transparent)]"
            >
              Cere o ofertă
            </Link>
          </div>

          {/* Two bars that rotate into an X rather than swapping one icon for
              another — the state change reads as one continuous movement. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="glass relative flex size-11 items-center justify-center rounded-full text-foreground lg:hidden"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
          >
            <span className="relative block h-4 w-[18px]" aria-hidden="true">
              <motion.span
                className="absolute left-0 top-1/2 block h-[1.5px] w-full rounded-full bg-current"
                animate={{ y: open ? 0 : -4, rotate: open ? 45 : 0 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                style={{ translateY: "-50%" }}
              />
              <motion.span
                className="absolute left-0 top-1/2 block h-[1.5px] w-full rounded-full bg-current"
                animate={{ y: open ? 0 : 4, rotate: open ? -45 : 0 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                style={{ translateY: "-50%" }}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Sibling of <header>, not a child — the header carries backdrop-blur
          once scrolled/open, which would otherwise establish a new
          containing block for this panel's fixed top/bottom anchoring. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            // Opaque, not glass: a full-screen panel that lets the hero headline
            // read through it just looks like a rendering bug. The depth comes
            // from the mesh and the motion instead.
            className="fixed inset-x-0 top-[72px] bottom-0 z-40 flex flex-col justify-between overflow-y-auto bg-background px-6 pb-8 pt-7 lg:hidden"
          >
            <div className="gradient-mesh opacity-25" aria-hidden="true" />

            <nav className="relative flex flex-col" aria-label="Navigare mobilă">
              {navLinks.map((link, i) => {
                const isActive = active === link.href;
                return (
                  // Each row is masked so the label rises into place instead of
                  // just fading — the stagger gives the panel a sense of order.
                  <span key={link.href} className="block overflow-hidden border-b border-border">
                    <motion.span
                      className="block"
                      initial={{ y: "115%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ delay: 0.06 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={sectionHref(link.href)}
                        onClick={() => setOpen(false)}
                        className="group flex items-baseline gap-4 py-4 transition-colors active:text-accent-2"
                      >
                        <span className="font-display w-6 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground transition-colors group-active:text-accent-2">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "font-display text-2xl font-medium transition-colors",
                            isActive ? "text-accent-2" : "text-foreground"
                          )}
                        >
                          {link.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "ml-auto size-1.5 shrink-0 self-center rounded-full transition-opacity",
                            isActive ? "bg-accent-2 opacity-100" : "opacity-0"
                          )}
                        />
                      </Link>
                    </motion.span>
                  </span>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + navLinks.length * 0.045, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-10 space-y-4"
            >
              <Link
                href={sectionHref("#contact")}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-[image:var(--gradient-blue-purple)] px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_color-mix(in_srgb,var(--color-accent-3)_70%,transparent)]"
              >
                Cere o ofertă
              </Link>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground transition-colors active:text-foreground"
              >
                {siteConfig.email}
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

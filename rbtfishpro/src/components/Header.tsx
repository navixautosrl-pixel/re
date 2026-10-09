"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { t } from "@/i18n/ro";
import { useCart, useHydrated } from "@/lib/cart";

export const NAV = [
  { href: "/magazin", label: t.nav.shop },
  { href: "/despre-noi", label: t.nav.about },
  { href: "/intrebari-frecvente", label: t.nav.faq },
  { href: "/contact", label: t.nav.contact },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-sm" aria-label="RbtFishPro — pagina principală">
      <picture>
        <source type="image/avif" srcSet="/img/label-fishmeal-96.avif" />
        <img src="/img/label-fishmeal-96.webp" width={40} height={40} alt="" className="size-10 rounded-full" />
      </picture>
      <span className="display text-[1.55rem] leading-none tracking-normal">
        Rbt<span className="text-cyan">Fish</span>Pro
      </span>
    </Link>
  );
}

function CartLink() {
  const lines = useCart();
  const hydrated = useHydrated();
  const count = hydrated ? lines.reduce((s, l) => s + l.qty, 0) : 0;
  return (
    <Link
      href="/cos"
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-2.5 font-semibold hover:bg-white/5"
      aria-label={count ? `${t.nav.cart}: ${count} ${count === 1 ? "pungă" : "pungi"}` : `${t.nav.cart}: gol`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
      <span className="hidden sm:inline">{t.nav.cart}</span>
      {count > 0 && (
        <span className="tabular grid min-w-6 place-items-center rounded-full bg-cyan px-1.5 text-sm font-bold leading-6 text-night" aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Solid background once the page has scrolled (sentinel observer — no scroll listener).
  useEffect(() => {
    const s = document.getElementById("top-sentinel");
    if (!s) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting));
    io.observe(s);
    return () => io.disconnect();
  }, []);

  // Close the menu when navigating.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 border-b border-transparent" data-solid={solid || pathname !== "/" ? "true" : "false"}>
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label={t.nav.primary} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-btn)] px-3 font-semibold text-mist-2 transition-colors hover:text-mist aria-[current=page]:text-mist aria-[current=page]:underline aria-[current=page]:decoration-cyan aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[0.6em]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <CartLink />
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-btn)] px-2.5 font-semibold hover:bg-white/5 md:hidden"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => dialog.current?.showModal()}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            {t.nav.menu}
          </button>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label={t.nav.menu}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDialogElement).open)}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-night-2 p-0 text-mist backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col px-6 pb-8">
          <div className="flex h-16 items-center justify-end">
            <button type="button" onClick={() => dialog.current?.close()} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-btn)] px-3 font-semibold hover:bg-white/5" autoFocus>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              {t.nav.close}
            </button>
          </div>
          <nav aria-label={t.nav.primary}>
            <ul className="flex flex-col gap-1">
              {[{ href: "/", label: t.nav.home }, ...NAV, { href: "/cos", label: t.nav.cart }].map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => dialog.current?.close()}
                    aria-current={(n.href === "/" ? pathname === "/" : isActive(n.href)) ? "page" : undefined}
                    className="display-2 flex min-h-12 items-center border-b border-white/10 text-[1.9rem] aria-[current=page]:text-cyan"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-auto text-[length:var(--step--1)] text-mist-2">{t.product.inapt}. www.rbtfishpro.ro</p>
        </div>
      </dialog>
    </header>
  );
}

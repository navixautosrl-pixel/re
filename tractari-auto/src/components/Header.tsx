"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

export const NAV = [
  { href: "/calculator/", label: "Calculator preț" },
  { href: "/servicii/", label: "Servicii" },
  { href: "/contact/", label: "Contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md font-[820] tracking-tight" aria-label={`${site.name} — pagina principală`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="8" fill="var(--sign)" />
        <path d="M7 22h20M9 22l2-6h8l3 3h3v3" stroke="white" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
        <circle cx="12" cy="24" r="2.6" fill="var(--beacon)" />
        <circle cx="23" cy="24" r="2.6" fill="var(--beacon)" />
        <rect x="14" y="10" width="6" height="3" rx="1.5" fill="var(--beacon)" />
      </svg>
      <span className="text-[1.2rem] leading-none">{site.name}</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const overDark = pathname === "/" && !solid;

  useEffect(() => {
    const s = document.getElementById("top-sentinel");
    if (!s) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting));
    io.observe(s);
    return () => io.disconnect();
  }, []);
  useEffect(() => dialog.current?.close(), [pathname]);

  const active = (href: string) => pathname === href || pathname === href.replace(/\/$/, "");

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-40 ${overDark ? "on-dark text-paint" : "text-ink"}`}
      data-solid={solid || pathname !== "/" ? "true" : "false"}
    >
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Navigare principală" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active(n.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold opacity-85 transition hover:opacity-100 aria-[current=page]:bg-sign aria-[current=page]:text-white aria-[current=page]:opacity-100"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/calculator/" className="btn btn-beacon hidden min-h-11 px-4 lg:inline-flex">
            Află prețul
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold md:hidden"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => dialog.current?.showModal()}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            Meniu
          </button>
        </div>
      </div>
      <dialog
        ref={dialog}
        aria-label="Meniu"
        onToggle={(e) => setOpen((e.currentTarget as HTMLDialogElement).open)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-asphalt p-0 text-paint backdrop:bg-black/50"
      >
        <div className="on-dark flex h-full flex-col px-6 pb-8">
          <div className="flex h-16 items-center justify-end">
            <button type="button" autoFocus onClick={() => dialog.current?.close()} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              Închide
            </button>
          </div>
          <nav aria-label="Navigare principală">
            <ul>
              {[{ href: "/", label: "Acasă" }, ...NAV].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={() => dialog.current?.close()} aria-current={(n.href === "/" ? pathname === "/" : active(n.href)) ? "page" : undefined} className="flex min-h-14 items-center border-b border-white/10 text-[1.6rem] font-[800] aria-[current=page]:text-beacon">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  );
}

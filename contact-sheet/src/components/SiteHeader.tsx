"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

// Next <Link> (not <a>) so hrefs get the basePath on subpath deployments.
const NAV = [
  { href: "/#sheet", label: "Sheet" },
  { href: "/#strip", label: "On a phone" },
  { href: "/#method", label: "How it's proofed" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-table/92 backdrop-blur-[3px]">
      <div className="relative mx-auto flex h-16 w-[min(100%-2rem,78rem)] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight" aria-label="Contact Sheet, home">
          <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="3" className="fill-film" />
            <rect x="5" y="9" width="22" height="14" className="fill-table" />
            <ellipse cx="16" cy="16" rx="8.5" ry="5.5" fill="none" className="stroke-pencil" strokeWidth="2" />
          </svg>
          Contact Sheet
        </Link>
        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex gap-7 text-[0.95rem]">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="decoration-pencil decoration-2 underline-offset-[6px] hover:underline">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <button
          ref={toggle} type="button" className="-mr-2 inline-flex h-11 w-11 items-center justify-center sm:hidden"
          aria-expanded={open} aria-controls={id} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" stroke="currentColor" strokeWidth="2" fill="none">
            {open ? <path d="M4 4l14 14M18 4L4 18" /> : <path d="M2 7h18M2 15h18" />}
          </svg>
        </button>
        {/* Overlay panel (out of flow) so closing it never shifts anchor targets. */}
        <nav id={id} aria-label="Primary" hidden={!open} className="absolute inset-x-[-1rem] top-full border-b border-rule bg-table px-4 pb-3 sm:hidden">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} onClick={() => setOpen(false)} className="block py-3 text-lg">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

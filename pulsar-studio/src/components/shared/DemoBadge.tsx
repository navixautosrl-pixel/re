"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Every /demo/* page is a fictional business built to show what Pulsar
 * Studio can build — never a real client. This stays visible (not hidden
 * behind hover) so nobody mistakes it for a live business, without
 * breaking the "looks like a real site" illusion the page itself creates.
 * Top-right, below each demo's own navbar — every hero in this project
 * keeps that corner empty (left-aligned or centered content), whereas a
 * bottom-anchored badge collided with wrapped CTA buttons on short mobile
 * viewports.
 */
export function DemoBadge({ dark = true }: { dark?: boolean }) {
  return (
    <Link
      href="/#portofoliu"
      className={`group fixed right-4 top-20 z-[90] flex items-center gap-2 rounded-full border py-2 pl-2.5 pr-2.5 text-xs font-semibold shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all hover:-translate-y-0.5 sm:pr-4 ${
        dark ? "border-white/15 bg-black/60 text-white" : "border-black/10 bg-white/80 text-black"
      }`}
    >
      <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Demo Pulsar Studio</span>
    </Link>
  );
}

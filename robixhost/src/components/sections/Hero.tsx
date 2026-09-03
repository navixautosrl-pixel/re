"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroFallback2D } from "@/components/hero/HeroFallback2D";
import { isLowPowerDevice, supportsWebGL } from "@/lib/device";

const HeroCanvas3D = dynamic(
  () => import("@/components/hero/HeroCanvas3D").then((m) => m.HeroCanvas3D),
  { ssr: false, loading: () => <HeroFallback2D /> }
);

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [capability, setCapability] = useState<"checking" | "3d" | "3d-reduced" | "2d">(
    "checking"
  );

  // Reads prefers-reduced-motion / WebGL support / device capability
  // (external systems) to decide how to render the hero visual.
  useEffect(() => {
    let next: "3d" | "3d-reduced" | "2d";
    if (prefersReducedMotion || !supportsWebGL()) {
      next = "2d";
    } else {
      next = isLowPowerDevice() ? "3d-reduced" : "3d";
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCapability(next);
  }, [prefersReducedMotion]);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-[0.08]" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-28 lg:px-8">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-data text-xs text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            INFRASTRUCTURĂ ACTIVĂ
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Hosting built for what&apos;s next.
          </h1>
          <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
            Hosting rapid, infrastructură performantă, protecție DDoS și suport real — pentru
            afaceri care nu-și permit downtime.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/pricing">Vezi planurile</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-transparent hover:bg-surface-elevated"
            >
              <Link href="#infrastructure">Descoperă infrastructura</Link>
            </Button>
          </div>
        </div>

        <div className="relative h-[340px] sm:h-[420px] lg:h-[480px]">
          {capability === "checking" ? (
            <HeroFallback2D />
          ) : capability === "2d" ? (
            <HeroFallback2D />
          ) : (
            <HeroCanvas3D reduced={capability === "3d-reduced"} />
          )}
        </div>
      </div>
    </section>
  );
}

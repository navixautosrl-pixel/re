"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroFallback2D } from "@/components/hero/HeroFallback2D";
import { TextReveal } from "@/components/shared/TextReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { isLowPowerDevice, supportsWebGL } from "@/lib/device";

const HeroCanvas3D = dynamic(
  () => import("@/components/hero/HeroCanvas3D").then((m) => m.HeroCanvas3D),
  { ssr: false, loading: () => <HeroFallback2D /> }
);

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [capability, setCapability] = useState<"checking" | "3d" | "3d-reduced" | "2d">("checking");

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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.05]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1400px] gap-8 px-6 pb-10 pt-16 sm:gap-12 sm:pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-32 lg:pt-24">
        <div className="lg:col-span-5">
          <p className="font-mono-tech text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Hosting pentru infrastructură reală
          </p>
          <TextReveal
            as="h1"
            delayStart={0.1}
            lines={["Infrastructure", "built for", "performance."]}
            className="mt-5 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]"
          />
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Hosting, VPS și servere dedicate pe NVMe, cu protecție DDoS inclusă din prima zi —
            plus creare de website-uri, marketing și SEO, dacă vrei totul dintr-un singur loc.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button asChild size="lg" variant="primary">
                <Link href="/pricing">Vezi planurile</Link>
              </Button>
            </MagneticButton>
            <Button asChild size="lg" variant="ghost">
              <Link href="#infrastructure">Explorează infrastructura</Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7 lg:pt-8">
          <div className="h-[280px] sm:h-[440px] lg:h-[560px]">
            {capability === "checking" || capability === "2d" ? (
              <HeroFallback2D />
            ) : (
              <HeroCanvas3D reduced={capability === "3d-reduced"} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

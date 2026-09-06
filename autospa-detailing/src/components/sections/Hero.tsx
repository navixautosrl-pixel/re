"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Phone, Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroFallback2D } from "@/components/hero/HeroFallback2D";
import { TextReveal } from "@/components/shared/TextReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { isLowPowerDevice, supportsWebGL } from "@/lib/device";
import { siteConfig } from "@/lib/constants";

const HeroCanvas3D = dynamic(() => import("@/components/hero/HeroCanvas3D").then((m) => m.HeroCanvas3D), {
  ssr: false,
  loading: () => <HeroFallback2D />,
});

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [capability, setCapability] = useState<"checking" | "3d" | "3d-reduced" | "2d">("checking");

  useEffect(() => {
    let next: "3d" | "3d-reduced" | "2d";
    if (prefersReducedMotion || !supportsWebGL()) next = "2d";
    else next = isLowPowerDevice() ? "3d-reduced" : "3d";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCapability(next);
  }, [prefersReducedMotion]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.05]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1300px] gap-8 px-6 pb-10 pt-16 sm:gap-12 sm:pb-20 sm:pt-20 lg:grid-cols-12 lg:px-10 lg:pb-32 lg:pt-24">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 font-medium text-sm text-accent">
            <Star className="h-4 w-4 fill-accent" aria-hidden="true" />
            {siteConfig.rating.toFixed(1)} · {siteConfig.reviewCount} recenzii Google
          </div>
          <TextReveal
            as="h1"
            delayStart={0.1}
            lines={["Mașina ta,", "ca nouă."]}
            className="mt-5 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-[4rem]"
          />
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Spălătorie auto și detailing profesional în {siteConfig.locality} — exterior, interior,
            tapițerie și protecție lac, făcute cu răbdare, nu în grabă.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button asChild size="lg">
                <a href={siteConfig.phoneHref}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Sună acum — {siteConfig.phone}
                </a>
              </Button>
            </MagneticButton>
            <Button asChild size="lg" variant="ghost">
              <a href="#servicii">Vezi serviciile</a>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6 lg:pt-8">
          <div className="h-[280px] sm:h-[420px] lg:h-[520px]">
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

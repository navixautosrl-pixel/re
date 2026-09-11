"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { siteConfig } from "@/lib/constants";
import { useCountUp } from "@/components/shared/useCountUp";

export function GoogleRating() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const rating = useCountUp(siteConfig.rating, 1, inView, !!prefersReducedMotion);
  const reviews = useCountUp(siteConfig.reviewCount, 0, inView, !!prefersReducedMotion);

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface">
      <div className="court-glow opacity-45" />
      <div className="container-max relative px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-28" ref={ref}>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recomandat pe Google
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-6 fill-accent text-accent sm:size-7" strokeWidth={0} />
            ))}
          </div>
          <p className="font-display mt-6 text-8xl leading-none text-foreground sm:text-9xl">{rating}</p>
          <p className="mt-4 text-base text-muted-foreground">
            din 5, pe baza a <span className="text-foreground">{reviews}</span> recenzii Google
          </p>
          <a
            href={siteConfig.mapsReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            Vezi pe Google
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

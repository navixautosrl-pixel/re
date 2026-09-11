"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/components/shared/useCountUp";

export function RatingBadge({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();

  const rating = useCountUp(siteConfig.rating, 1, inView, !!prefersReducedMotion);
  const reviews = useCountUp(siteConfig.reviewCount, 0, inView, !!prefersReducedMotion);

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-3 rounded-sm border px-4 py-2.5",
        variant === "dark" ? "border-border-strong bg-surface" : "border-accent-foreground/20 bg-accent-foreground/5",
        className
      )}
    >
      <div className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-accent text-accent" strokeWidth={0} />
        ))}
      </div>
      <span className="font-display text-xl leading-none">{rating}</span>
      <span className="h-4 w-px bg-border-strong" aria-hidden="true" />
      <span className="font-sans text-sm text-muted-foreground">
        {reviews} recenzii Google
      </span>
    </div>
  );
}

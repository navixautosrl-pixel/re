"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteImage } from "@/components/shared/SiteImage";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { TextReveal } from "@/components/shared/TextReveal";
import { activities, siteConfig } from "@/lib/constants";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <section id="acasa" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background">
      <div className="absolute inset-0">
        <SiteImage
          src="/images/riviera-lounge-court.webp"
          alt="Terenul de padel Riviera, văzut din zona de lounge"
          className="h-full w-full"
          objectPosition="center 62%"
          priority
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20"
          initial={{ opacity: prefersReducedMotion ? 1 : 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="court-glow" />
      </div>

      <div className="container-max relative z-10 flex flex-1 flex-col justify-end px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-24 lg:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono mb-6 text-xs uppercase tracking-[0.3em] text-accent"
        >
          {activities.join(" · ")}
        </motion.p>

        <h1 className="font-display text-[19vw] uppercase leading-[0.92] tracking-[-0.02em] text-foreground sm:text-[11rem] lg:text-[13rem]">
          <TextReveal lines={["Joacă.", "Conectează-te.", "Revino."]} delay={0.15} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-md text-lg leading-relaxed text-foreground/85 sm:text-xl"
        >
          Padel, ping-pong și biliard într-un lounge sportiv premium din București.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button href={bookingHref} variant="primary" size="lg">
            Rezervă un teren
          </Button>
          <Button href="#riviera" variant="outline" size="lg" icon={false}>
            Descoperă Riviera
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="mt-12"
        >
          <RatingBadge />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="relative z-10 hidden justify-center pb-8 sm:flex"
        aria-hidden="true"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}

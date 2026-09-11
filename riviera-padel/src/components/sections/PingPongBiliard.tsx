"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { SiteImage } from "@/components/shared/SiteImage";
import { siteConfig } from "@/lib/constants";

// Same real photo for both — it shows the ping-pong tables and the pool
// table in one frame — cropped toward whichever is relevant per card.
const items = [
  {
    key: "ping-pong" as const,
    name: "Ping-Pong",
    headline: "Schimbă ritmul.",
    copy: "Un joc rapid pentru orice pauză — perfect între două seturi de padel sau ca meci de sine stătător.",
    color: "var(--color-accent-2)",
    objectPosition: "15% 45%",
  },
  {
    key: "biliard" as const,
    name: "Biliard",
    headline: "Joacă după propriile reguli.",
    copy: "Ritm mai lent, aceeași miză socială — biliardul e locul unde meciul continuă la o băutură.",
    color: "var(--color-accent-3)",
    objectPosition: "95% 90%",
  },
];

export function PingPongBiliard() {
  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <section id="facilitati" className="bg-background">
      <div className="grid sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.key} delay={i * 0.1} className="group relative">
            <a href={bookingHref} className="block">
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4] lg:aspect-[4/5]">
                <motion.div
                  className="h-full w-full"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SiteImage
                    src="/images/riviera-biliard-pingpong.webp"
                    alt={`Zona de ${item.name.toLowerCase()} din lounge-ul Riviera`}
                    className="h-full w-full"
                    objectPosition={item.objectPosition}
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-[var(--ease-premium)] group-hover:opacity-100"
                  style={{ boxShadow: `inset 0 0 0 2px ${item.color}` }}
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                  <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: item.color }}>
                    {item.name}
                  </p>
                  <h3 className="font-display mt-3 text-4xl uppercase leading-[0.95] tracking-[-0.01em] text-foreground sm:text-5xl">
                    {item.headline}
                  </h3>
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/75">{item.copy}</p>
                  <span
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:[color:var(--item-color)]"
                    style={{ ["--item-color" as string]: item.color }}
                  >
                    Rezervă
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

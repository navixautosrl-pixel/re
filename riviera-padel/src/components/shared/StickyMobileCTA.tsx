"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bookingHref = siteConfig.bookingUrl ?? "#contact";

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border-strong bg-background/95 p-3 backdrop-blur-md transition-transform duration-300 ease-[var(--ease-premium)] md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      aria-hidden={!visible}
    >
      <a
        href={siteConfig.phoneHref}
        className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface-elevated text-foreground"
        aria-label={`Sună la ${siteConfig.phoneDisplay}`}
      >
        <Phone className="size-5" aria-hidden="true" />
      </a>
      <a
        href={bookingHref}
        className="flex flex-1 items-center justify-center rounded-sm bg-accent px-4 text-sm font-semibold uppercase tracking-[0.06em] text-accent-foreground"
      >
        Rezervă un teren
      </a>
    </div>
  );
}

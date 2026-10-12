"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Adds .is-off to animated zones ([data-anim]) while they are off screen, pausing their loops. */
export function PauseOffscreen() {
  const path = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-anim]");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-off", !e.isIntersecting)), { rootMargin: "100px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}

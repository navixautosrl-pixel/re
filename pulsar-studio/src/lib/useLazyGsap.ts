"use client";

import { useEffect } from "react";
import type gsapDefault from "gsap";

export type Gsap = typeof gsapDefault;

/**
 * Loads GSAP + ScrollTrigger on demand, then runs `setup` once the component
 * is mounted. Importing GSAP statically put it in a chunk shared by every
 * route — including the three demos that never animate with it — so this
 * keeps ~150 kB of JS off those pages while the component itself still
 * server-renders normally.
 *
 * `setup` must be stable (wrap it in useCallback); it may return a cleanup
 * function, which runs on unmount.
 */
export function useLazyGsap(setup: (gsap: Gsap) => (() => void) | void) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | void;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      cleanup = setup(gsap);
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [setup]);
}

"use client";

/**
 * Heuristic used to decide whether to render the WebGL/3D experience
 * (cinematic intro particles, 3D hero scene) or fall back to a CSS/2D
 * version. Runs client-side only — call inside useEffect, never during
 * render, since it reads window/navigator.
 */
export function isLowPowerDevice(): boolean {
  if (typeof window === "undefined") return true;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return true;

  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isNarrowViewport = window.matchMedia("(max-width: 820px)").matches;
  if (isCoarsePointer && isNarrowViewport) return true;

  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (
    typeof nav.hardwareConcurrency === "number" &&
    nav.hardwareConcurrency <= 4 &&
    isCoarsePointer
  ) {
    return true;
  }

  return false;
}

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

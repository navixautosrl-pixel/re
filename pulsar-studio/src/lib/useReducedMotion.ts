"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server can't know the preference, so it renders the animated markup.
// React uses this same value for the hydration render, which is the whole
// point: framer-motion's own useReducedMotion reads matchMedia during that
// first client render instead, so a visitor with "reduce" set got markup
// (and inline transform styles) that didn't match the server's — a hydration
// mismatch on every page. useSyncExternalStore keeps hydration identical and
// re-renders with the real preference immediately afterwards.
const getServerSnapshot = () => false;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

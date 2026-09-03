"use client";

import { useCallback, useEffect, useState } from "react";

export type ConsentCategories = {
  necessary: true; // always on, not user-toggleable
  analytics: boolean;
  marketing: boolean;
};

export type ConsentState = {
  decided: boolean;
  categories: ConsentCategories;
};

const STORAGE_KEY = "robixhost-cookie-consent-v1";
const EVENT_NAME = "robixhost:cookie-consent-changed";

const defaultState: ConsentState = {
  decided: false,
  // Only strictly-necessary cookies are active until the visitor decides —
  // analytics/marketing never load before explicit consent.
  categories: { necessary: true, analytics: false, marketing: false },
};

function readConsent(): ConsentState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as ConsentState;
    return {
      decided: true,
      categories: {
        necessary: true,
        analytics: !!parsed.categories?.analytics,
        marketing: !!parsed.categories?.marketing,
      },
    };
  } catch {
    return defaultState;
  }
}

function writeConsent(categories: Omit<ConsentCategories, "necessary">) {
  const next: ConsentState = {
    decided: true,
    categories: { necessary: true, ...categories },
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  return next;
}

export function useCookieConsent() {
  const [state, setState] = useState<ConsentState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Reads localStorage (an external system) on mount, then subscribes to
  // this-tab/other-component changes via a custom event — both legitimate
  // effect responsibilities.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readConsent());
     
    setHydrated(true);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      if (detail) setState(detail);
    };
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const acceptAll = useCallback(() => {
    setState(writeConsent({ analytics: true, marketing: true }));
  }, []);

  const rejectOptional = useCallback(() => {
    setState(writeConsent({ analytics: false, marketing: false }));
  }, []);

  const savePreferences = useCallback(
    (prefs: { analytics: boolean; marketing: boolean }) => {
      setState(writeConsent(prefs));
    },
    []
  );

  return { ...state, hydrated, acceptAll, rejectOptional, savePreferences };
}

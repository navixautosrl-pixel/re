"use client";

import { useEffect } from "react";
import { useConsent } from "@/components/shared/CookieConsent";
import { analytics } from "@/lib/constants";

/*
 * Google Analytics, pornit numai după acord.
 *
 * Eticheta GA pusă direct în layout ar rula la prima încărcare, înainte ca
 * vizitatorul să fi răspuns ceva — adică exact ce interzice legea pentru
 * cookie-urile care nu sunt strict necesare. Aici se încarcă abia când
 * categoria „analiză de trafic” a fost acceptată.
 *
 * Dacă `googleAnalyticsId` e gol, componenta nu face absolut nimic — ceea ce
 * e și starea implicită a site-ului.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

function loadGtag(id: string) {
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;

  gtag("js", new Date());
  // Fără semnale de publicitate: măsurăm traficul, nu urmărim oameni între
  // site-uri. Restrânge și ce trebuie declarat în politica de cookie-uri.
  gtag("config", id, { anonymize_ip: true, allow_google_signals: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function Analytics() {
  const { consent, mounted } = useConsent();

  useEffect(() => {
    if (!analytics.googleAnalyticsId) return;
    if (!mounted || consent?.analytics !== true) return;
    loadGtag(analytics.googleAnalyticsId);
  }, [mounted, consent]);

  return null;
}

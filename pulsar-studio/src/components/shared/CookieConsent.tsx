"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

/*
 * Consimțământ pentru cookie-uri, cu categorii.
 *
 * Regula pe care o respectă, și motivul pentru care nu are doar un buton
 * „Am înțeles”: sub GDPR și Directiva ePrivacy, orice altceva decât
 * cookie-urile strict necesare are nevoie de consimțământ explicit, dat
 * printr-o acțiune clară, la fel de ușor de refuzat pe cât e de acceptat.
 * De aceea „Refuz” e un buton de același rang cu „Acceptă toate”, iar nimic
 * nu e bifat din start.
 *
 * Nimic nu se încarcă înainte de acord: `window.cwpConsent` e singurul loc
 * din care se citește alegerea, iar scripturile de analiză se pornesc din
 * evenimentul `cwp:consent` — vezi comentariul de la finalul fișierului.
 */

const STORAGE_KEY = "cwp-consent";
const VERSION = 1;
/** 12 luni — după asta întrebăm din nou, cum cere ghidajul autorităților. */
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const OPEN_SETTINGS_EVENT = "cwp:open-cookie-settings";
const CHANGED_EVENT = "cwp:consent";

export type ConsentState = {
  v: number;
  analytics: boolean;
  /** Momentul alegerii, ca să știm când a expirat. */
  ts: number;
};

function parse(raw: string): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.v !== VERSION) return null;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // Mod incognito sau stocare blocată: tratăm ca „nu avem acord”, deci
    // întrebăm. Mai bine întrebăm de două ori decât să presupunem un acord
    // pe care nu îl putem dovedi.
    return "";
  }
}

function readState(): ConsentState | null {
  return typeof window === "undefined" ? null : parse(readRaw());
}

/*
 * Starea vine din localStorage prin useSyncExternalStore, nu dintr-un
 * useState scris într-un efect: altfel primul render (pe server și la
 * hidratare) ar desena bannerul pentru toată lumea, inclusiv pentru cine
 * a răspuns deja, iar React ar semnala nepotrivire de hidratare.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED_EVENT, onChange);
  // Alegerea făcută într-o altă filă trebuie să închidă bannerul și aici.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};

declare global {
  interface Window {
    cwpConsent?: {
      get: () => ConsentState | null;
      accepted: (category: "analytics") => boolean;
      openSettings: () => void;
    };
  }
}

/**
 * Alegerea curentă a vizitatorului, sau `null` dacă nu a răspuns încă. Și
 * `mounted`, pentru că pe server nu știm ce a ales: orice desenăm în funcție
 * de consimțământ trebuie să aștepte browserul, altfel clipește la hidratare.
 *
 * Exportat pentru că nu doar bannerul are nevoie de el — chatul live se
 * ascunde cât timp bannerul e deschis, ca să nu se suprapună peste el.
 */
export function useConsent() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  const consent = useMemo(() => parse(raw), [raw]);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  return { consent, mounted };
}

export function CookieConsent() {
  const prefersReducedMotion = useReducedMotion();
  const { consent, mounted } = useConsent();

  const [panelOpen, setPanelOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const open = mounted && (panelOpen || consent === null);

  const save = useCallback((next: boolean) => {
    const state: ConsentState = { v: VERSION, analytics: next, ts: Date.now() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Dacă nu putem salva, bannerul reapare la următoarea vizită.
    }
    setPanelOpen(false);
    setShowDetails(false);
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: state }));
  }, []);

  const openSettings = useCallback(() => {
    setAnalytics(readState()?.analytics ?? false);
    setShowDetails(true);
    setPanelOpen(true);
  }, []);

  useEffect(() => {
    window.cwpConsent = {
      get: readState,
      accepted: (category) => readState()?.[category] === true,
      openSettings,
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, [openSettings]);

  // Escape închide doar dacă există deja o alegere salvată. Altfel ar fi o
  // cale de a scăpa de banner fără a răspunde, iar la reîncărcare ar apărea
  // din nou — supărător și fără rost.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && consent) setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, consent]);

  const duration = prefersReducedMotion ? 0 : 0.45;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="cookie-consent"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-xl border border-border bg-[color:var(--color-surface)] p-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)] sm:inset-x-6 sm:bottom-6 sm:p-6"
        >
          <h2 id="cookie-title" className="font-display text-base font-semibold text-foreground">
            Cookie-uri pe acest site
          </h2>
          <p id="cookie-desc" className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Folosim o singură setare strict necesară, ca să reținem răspunsul tău de aici. Orice altceva — de exemplu
            măsurarea traficului — pornește doar dacă îl accepți. Detaliile sunt în{" "}
            <Link href="/cookies" className="text-accent-2 underline underline-offset-2">
              politica de cookie-uri
            </Link>
            .
          </p>

          <AnimatePresence initial={false}>
            {showDetails ? (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-5 space-y-3 border-t border-border pt-5">
                  <Category
                    title="Strict necesare"
                    description="Rețin alegerea ta de aici, ca să nu te întrebăm la fiecare pagină. Nu pot fi oprite."
                    checked
                    locked
                  />
                  <Category
                    title="Analiză de trafic"
                    description="Ne-ar arăta ce pagini sunt citite și de unde vin vizitatorii. Momentan nu e instalat niciun astfel de instrument; dacă va fi, va porni doar cu acordul tău."
                    checked={analytics}
                    onChange={setAnalytics}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => save(true)}
              className="order-1 rounded-full bg-[image:var(--gradient-blue-purple)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:order-3"
            >
              Acceptă toate
            </button>
            <button
              type="button"
              onClick={() => save(showDetails ? analytics : false)}
              className="order-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent-2 hover:text-accent-2"
            >
              {showDetails ? "Salvează alegerea" : "Refuz"}
            </button>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              className="order-3 py-3 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground sm:order-1 sm:mr-auto sm:px-0"
            >
              {showDetails ? "Ascunde detaliile" : "Setări"}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Category({
  title,
  description,
  checked,
  locked = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3.5 rounded-lg border border-border p-3.5",
        locked ? "opacity-70" : "cursor-pointer transition-colors hover:border-accent-2/50"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[color:var(--color-accent)]"
      />
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

/** Redeschide panoul din orice altă parte a site-ului (subsol, /cookies). */
export function CookieSettingsButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT))}
    >
      {children}
    </button>
  );
}

/*
 * PUNCT DE INTEGRARE — când adaugi un instrument de analiză.
 *
 * Nu pune eticheta direct în layout: ar rula înainte de orice acord, ceea ce
 * e exact ce interzice legea. Pornește-l de aici:
 *
 *   window.addEventListener("cwp:consent", (e) => {
 *     if ((e as CustomEvent<ConsentState>).detail.analytics) loadAnalytics();
 *   });
 *
 * și, la încărcarea paginii, pentru vizitatorii care au acceptat deja:
 *
 *   if (window.cwpConsent?.accepted("analytics")) loadAnalytics();
 *
 * După ce îl adaugi, completează și secțiunea 2 din /cookies cu numele
 * furnizorului și durata cookie-urilor lui.
 */

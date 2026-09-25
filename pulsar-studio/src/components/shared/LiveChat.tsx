"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useConsent } from "@/components/shared/CookieConsent";
import { siteConfig } from "@/lib/constants";
import { useReducedMotion } from "@/lib/useReducedMotion";

/*
 * Chat live (Tawk.to).
 *
 * De ce nu e pus direct în pagină, ca eticheta din documentația Tawk:
 * scriptul lor pornește la încărcarea paginii, trimite IP-ul fiecărui
 * vizitator pe serverele lor și îi pune cookie-uri proprii (__tawkuuid și
 * altele) înainte ca omul să fi cerut ceva. Asta ar transforma două
 * afirmații din /cookies în minciuni — că niciun terț nu primește IP-ul prin
 * simpla vizitare a paginii, și că nimic în afara setării strict necesare nu
 * pornește fără acord.
 *
 * Varianta pornită la cerere a fost construită tot aici și e la un cuvânt
 * distanță: `LOAD_ON = "click"` afișează în loc un buton desenat de noi, iar
 * Tawk se încarcă abia la apăsarea lui.
 *
 * Proprietarul a ales însă `"load"` — widgetul pornește la fiecare vizită,
 * ca să poată trimite mesaje proactive. Asta înseamnă că Tawk devine un terț
 * activ pe fiecare pagină, iar /cookies spune asta explicit: ce cookie-uri
 * pune, pe ce durată și cine le primește.
 */

const TAWK_SRC = "https://embed.tawk.to/6ab5b35a64e731344b0048a6/default";
const LOAD_ON: "click" | "load" = "load";

type TawkApi = {
  onLoad?: () => void;
  maximize?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

let injected = false;

/** Eticheta Tawk, cuvânt cu cuvânt, doar mutată în momentul potrivit. */
function injectTawk(onReady: () => void) {
  if (injected) return;
  injected = true;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  window.Tawk_API.onLoad = onReady;

  const s1 = document.createElement("script");
  const s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = TAWK_SRC;
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  s0?.parentNode?.insertBefore(s1, s0);
}

export function LiveChat() {
  const prefersReducedMotion = useReducedMotion();
  const { consent, mounted } = useConsent();
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  const open = useCallback(() => {
    setState("loading");
    injectTawk(() => {
      setState("ready");
      window.Tawk_API?.maximize?.();
    });
    // Blocantele de reclame taie embed.tawk.to, iar atunci `onLoad` nu mai
    // vine niciodată. Fără plasa asta, butonul ar rămâne pe „Se deschide…”
    // la nesfârșit, fără să spună nimănui ce s-a întâmplat.
    window.setTimeout(() => {
      setState((current) => (current === "loading" ? "failed" : current));
    }, 8000);
  }, []);

  // Varianta „pornește la fiecare vizită”. setState stă în callback-ul de
  // încărcare, nu în corpul efectului, ca să nu declanșeze un al doilea
  // render imediat după primul.
  useEffect(() => {
    if (LOAD_ON !== "load") return;
    injectTawk(() => setState("ready"));
  }, []);

  // Butonul nostru apare doar în varianta „la click”, și doar după ce
  // vizitatorul a răspuns la bannerul de cookie-uri: pe telefon cele două
  // s-ar suprapune exact unul peste altul.
  const visible = LOAD_ON === "click" && mounted && consent !== null && state !== "ready";

  if (state === "failed") {
    return (
      <div
        role="status"
        className="fixed bottom-5 right-5 z-[80] max-w-[17rem] rounded-xl border border-border bg-[color:var(--color-surface)] p-4 text-sm leading-relaxed text-muted-foreground shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)] sm:bottom-7 sm:right-7"
      >
        Chatul nu a putut porni — de obicei din cauza unui blocant de reclame. Scrie-ne la{" "}
        <a href={`mailto:${siteConfig.email}`} className="text-accent-2 underline underline-offset-2">
          {siteConfig.email}
        </a>{" "}
        sau sună la{" "}
        <a href={`tel:${siteConfig.phoneHref}`} className="text-accent-2 underline underline-offset-2">
          {siteConfig.phone}
        </a>
        .
      </div>
    );
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={open}
          disabled={state === "loading"}
          aria-label="Deschide chatul live"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group fixed bottom-5 right-5 z-[80] flex items-center gap-2.5 rounded-full bg-[image:var(--gradient-blue-purple)] py-3.5 pl-4 pr-5 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(59,110,255,0.85)] transition-opacity hover:opacity-95 disabled:opacity-70 sm:bottom-7 sm:right-7"
        >
          {state === "loading" ? (
            <>
              <span
                className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Se deschide…
            </>
          ) : (
            <>
              <MessageCircle className="size-5" aria-hidden="true" />
              Scrie-ne
            </>
          )}
          <span className="sr-only" role="status">
            {state === "loading" ? "Chatul se încarcă." : ""}
          </span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

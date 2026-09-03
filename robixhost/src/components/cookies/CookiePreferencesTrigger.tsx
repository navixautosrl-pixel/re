"use client";

import { OPEN_PREFERENCES_EVENT } from "./CookieConsent";

export function CookiePreferencesTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className ?? "text-sm text-muted-foreground transition-colors hover:text-foreground"}
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
    >
      Preferințe cookie
    </button>
  );
}

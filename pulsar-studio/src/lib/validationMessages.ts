"use client";

import type { FormEvent } from "react";

/**
 * Browsers localise native validation bubbles to the *browser's* locale, not
 * the page's, so a Romanian visitor running an English Chrome saw "Please
 * fill out this field." on an otherwise fully Romanian site. Spread these
 * onto a constrained input to say it in Romanian instead.
 */
export const romanianValidation = {
  onInvalid: (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.setCustomValidity(
      input.validity.valueMissing
        ? "Te rugăm să completezi acest câmp."
        : "Introdu o adresă de email validă."
    );
  },
  // Cleared on every edit, otherwise the stale message keeps the field
  // invalid even once it has been corrected.
  onInput: (event: FormEvent<HTMLInputElement>) => {
    event.currentTarget.setCustomValidity("");
  },
};

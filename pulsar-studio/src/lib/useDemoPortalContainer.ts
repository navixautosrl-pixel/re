"use client";

import { useState } from "react";

/**
 * Radix's Dialog/Select portals render into document.body by default —
 * outside each /demo/* page's scoped `.demo-restaurant`/`.demo-fitness`/
 * `.demo-shop`/`.demo-agency` wrapper, so that wrapper's CSS custom
 * properties (--r-bg, --f-accent, etc.) resolve to nothing there and any
 * portaled content (modals, dropdowns) renders transparent/unstyled.
 * Every demo page gives its root wrapper `id="demo-scope"` — point the
 * portal's container at that element instead.
 *
 * A lazy useState initializer (not an effect) is enough: by the time this
 * client component's initializer runs — during hydration — the SSR'd
 * "demo-scope" element is already present in the DOM, since it's an
 * ancestor rendered as part of the same page. The container never changes
 * for the lifetime of the page, so no effect/resync is needed.
 */
export function useDemoPortalContainer() {
  const [container] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.getElementById("demo-scope") : null
  );

  return container;
}

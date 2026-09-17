"use client";

import { usePathname } from "next/navigation";

/**
 * The shared navbar/footer link to homepage sections with bare "#servicii"
 * hrefs. That works on the homepage, but on /privacy or /terms those
 * sections don't exist, so the links silently did nothing. Off-home they
 * need to point back at the homepage; on it they stay bare so the anchor
 * scrolls smoothly instead of triggering a navigation.
 */
export function useSectionHref() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  return (href: string) => (href.startsWith("#") && !isHome ? `/${href}` : href);
}

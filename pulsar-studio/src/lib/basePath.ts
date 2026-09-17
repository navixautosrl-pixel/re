// Mirrors next.config.ts's own BASE_PATH handling. Kept for parity with
// this repo's other static-export sites, and because next/image's `fill`
// mode doesn't reliably auto-prefix a plain string `src` under a subpath.
export const basePath = process.env.BASE_PATH || "";

export function withBasePath(path: string) {
  return `${basePath}${path}`;
}

/**
 * Shared Open Graph image. Next.js replaces (rather than merges) a child
 * route's `openGraph` object, so every page that sets its own must spread
 * this in or it silently ships without a social preview image.
 */
export const ogImages = [
  {
    url: withBasePath("/og.png"),
    width: 1200,
    height: 630,
    alt: "Pulsar Studio — agenție digitală",
  },
];

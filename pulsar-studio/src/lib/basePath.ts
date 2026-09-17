// Mirrors next.config.ts's own BASE_PATH handling. Kept for parity with
// this repo's other static-export sites, and because next/image's `fill`
// mode doesn't reliably auto-prefix a plain string `src` under a subpath.
export const basePath = process.env.BASE_PATH || "";

export function withBasePath(path: string) {
  return `${basePath}${path}`;
}

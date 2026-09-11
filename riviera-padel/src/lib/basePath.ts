// Mirrors next.config.ts's own BASE_PATH handling. next/image's `fill` mode
// doesn't auto-prefix a plain string `src` with basePath under a static
// export, so local image paths need it applied by hand.
export const basePath = process.env.BASE_PATH || "";

export function withBasePath(path: string) {
  return `${basePath}${path}`;
}

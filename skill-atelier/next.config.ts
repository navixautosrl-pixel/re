import type { NextConfig } from "next";
import path from "node:path";

// Static export: the page has no server logic. BASE_PATH lets a preview be
// hosted under a subpath (served that way by the QA script too).
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  env: { BASE_PATH: basePath },
  // create-next-app 16.4 enables cacheComponents, but under output: "export" it rejects
  // the `dynamic = "force-static"` that export requires on robots.ts/sitemap.ts.
  // A fully static site gains nothing from it, so it stays off here.
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

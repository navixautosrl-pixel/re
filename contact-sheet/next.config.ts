import type { NextConfig } from "next";
import path from "node:path";

// Static export. BASE_PATH supports subpath hosting (QA serves it that way).
// cacheComponents is intentionally off: with output "export" it rejects the
// force-static robots/sitemap routes (see nextjs-site-architecture skill).
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  env: { BASE_PATH: basePath },
  turbopack: {
    root: path.resolve(__dirname),
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;

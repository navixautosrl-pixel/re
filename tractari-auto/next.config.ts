import type { NextConfig } from "next";
import path from "node:path";

// Static export: the whole site (calculator included) runs in the browser, so it can be
// hosted anywhere — cPanel, Netlify, Vercel. Optional subpath via BASE_PATH at build time.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.BASE_PATH || undefined,
  images: { unoptimized: true },
  env: { BASE_PATH: process.env.BASE_PATH || "" },
  turbopack: {
    root: path.resolve(__dirname),
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;

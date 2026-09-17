import type { NextConfig } from "next";
import path from "node:path";

// Static export: no confirmed Node hosting target yet. BASE_PATH lets a
// preview build be hosted under a subpath (same pattern as this repo's
// other demo sites).
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: { unoptimized: true },
};

export default nextConfig;

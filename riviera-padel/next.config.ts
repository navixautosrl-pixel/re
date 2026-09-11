import type { NextConfig } from "next";
import path from "node:path";

// Static export: no confirmed Node hosting target yet, and the site has no
// server-side logic (booking runs through an external system once one is
// connected). BASE_PATH lets a preview build be hosted under a subpath.
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

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app lives in a subdirectory of a larger repo that has its own
  // unrelated package-lock.json at the root — pin the workspace root
  // explicitly so Turbopack doesn't guess wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Local-only images for now (brand logo); add remotePatterns here if
    // a real CMS/image host is introduced later.
    qualities: [75, 90],
  },
};

export default nextConfig;

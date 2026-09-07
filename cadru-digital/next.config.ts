import type { NextConfig } from "next";
import path from "node:path";

// Demo builds are hosted under a subpath (e.g. robixhost.ro/demo3/), not
// domain root, so absolute asset URLs (/_next/...) need that prefix baked
// in at build time. Set BASE_PATH when building a demo; leave unset for a
// real deploy at domain root.
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

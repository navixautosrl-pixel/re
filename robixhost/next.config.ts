import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // No backend, no auth, no Route Handlers — ships as plain static files
  // uploaded straight to standard hosting (WHMCS/cPanel handle accounts
  // and orders separately at clienti.robixhost.ro).
  output: "export",
  // Emits <route>/index.html for every page instead of flat <route>.html
  // — the only layout that resolves as a clean URL (/hosting/) on plain
  // static hosting (Apache/nginx/cPanel) with zero server config.
  trailingSlash: true,
  // This app lives in a subdirectory of a larger repo that has its own
  // unrelated package-lock.json at the root — pin the workspace root
  // explicitly so Turbopack doesn't guess wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Static export has no Image Optimization API at runtime — serve
    // the local brand asset as-is.
    unoptimized: true,
  },
};

export default nextConfig;

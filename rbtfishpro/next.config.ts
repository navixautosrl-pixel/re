import type { NextConfig } from "next";
import path from "node:path";

// Server mode (not static export): orders and contact messages are validated and
// priced on the server (src/app/api/*). cacheComponents is off: the app uses the
// classic static/dynamic rendering model, which is simpler for this size of site.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // No third-party scripts are loaded; inline scripts are Next's own bootstrap.
  { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true }, // images are pre-optimized to AVIF/WebP (scripts/README)
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    root: path.resolve(__dirname),
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;

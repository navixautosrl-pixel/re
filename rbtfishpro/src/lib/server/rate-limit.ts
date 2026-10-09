import "server-only";

/**
 * Fixed-window, in-memory rate limit per IP. Good enough for a single Node process;
 * on serverless (several instances) it's best-effort — put a WAF/edge rule in front for more.
 */
const hits = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  entry.n += 1;
  return entry.n <= limit;
}

/**
 * Client IP from headers our own infrastructure sets — never the leftmost X-Forwarded-For value,
 * which the client controls. Platform headers are trusted only when the deployment says so:
 *   x-vercel-forwarded-for → only on Vercel (VERCEL is set by the platform)
 *   x-real-ip              → only with TRUST_X_REAL_IP=true (your nginx/Caddy overwrites it)
 * Otherwise: the X-Forwarded-For entry added by the last TRUSTED_PROXY_HOPS proxies (default 1).
 */
export function clientIp(req: Request) {
  const h = req.headers;
  if (process.env.VERCEL) {
    const v = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
    if (v) return v;
  }
  if (process.env.TRUST_X_REAL_IP === "true") {
    const v = h.get("x-real-ip")?.trim();
    if (v) return v;
  }
  const hops = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const trusted = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
  return hops[hops.length - trusted] ?? "local";
}

/**
 * Per-IP limit first; only requests that pass it count toward the per-route backstop
 * (RATE_LIMIT_GLOBAL per minute, default 60 — ample for a small shop's orders and messages).
 */
// In-process limits can't stop a distributed attack (many real IPs) — put an edge/WAF rule in
// front for that. The backstop is clamped so a typo in RATE_LIMIT_GLOBAL can't lock the forms.
export function allow(route: string, req: Request, perIp = 5, global = Math.max(perIp * 10, Number(process.env.RATE_LIMIT_GLOBAL) || 60)) {
  return rateLimit(`${route}:${clientIp(req)}`, perIp) && rateLimit(`${route}:*`, global);
}

/** Rejects cross-site form posts: the Origin must match the Host the request came to. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

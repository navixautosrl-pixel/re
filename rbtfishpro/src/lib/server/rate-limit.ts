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
 * Client IP from headers our own proxy sets — never the leftmost X-Forwarded-For value,
 * which the client controls. Order: Vercel's header, x-real-ip (set by nginx/Caddy you run),
 * else the X-Forwarded-For entry added by the last TRUSTED_PROXY_HOPS proxies (default 1).
 */
export function clientIp(req: Request) {
  const h = req.headers;
  const direct = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  if (direct) return direct;
  const hops = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const trusted = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
  return hops[hops.length - trusted] ?? "local";
}

/** Per-IP limit plus a global per-route cap, so spoofed or rotating IPs can't flood the inbox. */
export function allow(route: string, req: Request, perIp = 5, global = 60) {
  return rateLimit(`${route}:*`, global) && rateLimit(`${route}:${clientIp(req)}`, perIp);
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

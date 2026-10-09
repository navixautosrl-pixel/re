---
name: api-integration
description: Integrating third-party APIs and building webhooks — server-side calls with secrets in env, typed and validated responses, timeouts/retries/backoff, caching and rate limits, idempotent webhook receivers with signature verification and replay protection, and testing with mocks. Use for any external API (booking, CRM, payments, maps, reviews) or incoming webhook.
---

# API integration & webhooks

## Purpose

External services wired in so that secrets stay secret, failures are handled, and events
are processed exactly once.

## When to activate

Calling an external API from a site/app; receiving webhooks (payments, CMS publish, form services, shipping).

## Calling APIs

1. **Where**: server only (Route Handler, Server Action, serverless function, build step). Browser calls only to public APIs with public keys (maps JS key restricted by referrer).
2. **Config**: `process.env.X_API_KEY` from env; add to `.env.example` with a comment; fail fast at startup if missing.
3. **Wrapper per service** (one file):
   ```ts
   const Booking = z.object({ id: z.string(), start: z.string().datetime(), status: z.enum(["confirmed", "pending"]) });
   export async function getBookings(day: string) {
     const ctrl = AbortSignal.timeout(8000);
     for (let attempt = 0; attempt < 3; attempt++) {
       const res = await fetch(`${BASE}/bookings?day=${encodeURIComponent(day)}`, {
         headers: { Authorization: `Bearer ${process.env.BOOKING_API_KEY}` }, signal: ctrl,
       });
       if (res.status === 429 || res.status >= 500) { await sleep(2 ** attempt * 500); continue; }
       if (!res.ok) throw new ApiError(res.status, await res.text());
       return z.array(Booking).parse(await res.json());
     }
     throw new ApiError(503, "booking API unavailable");
   }
   ```
   Timeouts always; retry only idempotent requests (GET, or POST with an idempotency key); validate the response shape.
4. **Cache** responses that don't change per user (`fetch` cache options / revalidate in Next, build-time fetch for static export, short TTL in memory for serverless).
5. **Degrade gracefully**: UI shows a useful fallback (phone number, "try again") instead of an empty section.

## Building webhook receivers

1. **Verify the signature** using the provider's scheme on the **raw body** (e.g. Stripe `constructEvent(raw, sig, secret)`; generic HMAC):
   ```ts
   import { createHmac, timingSafeEqual } from "node:crypto";
   const raw = await req.text();
   const expected = createHmac("sha256", process.env.WEBHOOK_SECRET!).update(raw).digest("hex");
   const got = req.headers.get("x-signature") ?? "";
   if (got.length !== expected.length || !timingSafeEqual(Buffer.from(got), Buffer.from(expected))) return new Response("bad signature", { status: 401 });
   ```
2. **Replay protection**: reject timestamps older than ~5 min when the provider signs a timestamp.
3. **Idempotency**: store processed event IDs (unique constraint); duplicate deliveries return 200 without re-processing.
4. **Respond fast** (200 within a few seconds); heavy work in a queue/background job.
5. **Least data**: fetch the full object from the API by ID instead of trusting the payload when it matters (payments).

## Failure prevention

- Secrets in `NEXT_PUBLIC_*` or client bundles.
- Parsing JSON before verifying the signature (body re-serialization breaks HMAC).
- No timeout → serverless function hangs until platform kill.
- Logging full payloads with personal data.

## Verification checklist

- [ ] Unit/integration tests with mocked API (`page.route` / `msw` / fetch stub) for success, 429, 500, malformed JSON.
- [ ] Webhook: valid signature → 200 + side effect once; invalid → 401; replayed event → no duplicate effect.
- [ ] `grep -r "<key prefix>" out/ .next/static` → nothing.
- [ ] Provider dashboard shows deliveries succeeding (needs account access).

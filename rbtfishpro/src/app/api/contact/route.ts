import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/schemas";
import { deliver, sinkFor } from "@/lib/server/deliver";
import { allow, sameOrigin } from "@/lib/server/rate-limit";

const json = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const TOPICS = { produse: "Produse", comanda: "O comandă", colaborare: "Colaborare", altceva: "Altceva" } as const;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json(403, { ok: false, error: "bad_origin" });
  if (!allow("contact", req)) return json(429, { ok: false, error: "rate_limited" });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return json(422, { ok: false, error: "validation", fields: fieldErrors(parsed.error) });
  const m = parsed.data;
  if (m.website) return json(200, { ok: true });
  if (!sinkFor("contact")) return json(503, { ok: false, error: "contact_not_configured" });

  const record = { createdAt: new Date().toISOString(), name: m.name, email: m.email, phone: m.phone, topic: m.topic, message: m.message };
  try {
    await deliver("contact", record, {
      subject: `Mesaj de pe site: ${TOPICS[m.topic]} — ${m.name}`,
      text: `${m.message}\n\n${m.name} · ${m.email}${m.phone ? ` · ${m.phone}` : ""}`,
      replyTo: m.email,
    });
  } catch (e) {
    console.error("[contact] delivery failed", e instanceof Error ? e.message : e);
    return json(502, { ok: false, error: "delivery_failed" });
  }
  return json(200, { ok: true });
}

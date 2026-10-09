import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Where orders and contact messages go. Configured with env vars, never in code:
 *   ORDER_SINK / CONTACT_SINK = "resend" | "file"   (unset → the API answers 503 "not configured")
 *   resend: RESEND_API_KEY, MAIL_TO, MAIL_FROM (a sender on a domain verified in Resend)
 *   file:   DATA_DIR (default ./.data) — JSON Lines, for local testing or a VPS with a disk.
 *           Not for Vercel/serverless (read-only, ephemeral filesystem).
 */
export type Sink = "resend" | "file";
export type Kind = "orders" | "contact";

export function sinkFor(kind: Kind): Sink | null {
  const v = (kind === "orders" ? process.env.ORDER_SINK : process.env.CONTACT_SINK)?.trim();
  if (v === "file") return "file";
  if (v === "resend" && process.env.RESEND_API_KEY && process.env.MAIL_TO && process.env.MAIL_FROM) return "resend";
  return null;
}

export async function deliver(kind: Kind, record: Record<string, unknown>, mail: { subject: string; text: string; replyTo?: string }) {
  const sink = sinkFor(kind);
  if (!sink) throw new Error("sink_not_configured");
  if (sink === "file") {
    const dir = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.DATA_DIR || ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, `${kind}.jsonl`), JSON.stringify(record) + "\n", "utf8");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO!.split(",").map((s) => s.trim()),
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`resend_${res.status}`);
}

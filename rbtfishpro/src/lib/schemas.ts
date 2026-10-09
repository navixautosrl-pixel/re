import { z } from "zod";
import { COUNTIES } from "@/lib/counties";
import { MAX_LINES, MAX_QTY } from "@/lib/pricing";
import { site } from "@/config/site";

// Shared by the forms (client-side feedback) and the API routes (the real check).
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s().-]/g, ""))
  .refine((v) => /^(\+40|0040|0)[237]\d{8}$/.test(v), "Introdu un număr de telefon românesc, de ex. 07xx xxx xxx.");

const name = z.string().trim().min(3, "Scrie numele complet.").max(80, "Maximum 80 de caractere.");
const email = z.string().trim().max(120).email("Adresa de e-mail nu pare corectă.");
const consent = z.literal(true, { error: "Bifează pentru a continua." });

export const cartLineSchema = z.object({
  slug: z.string().max(80),
  diameter: z.union([z.literal(20), z.literal(24)]),
  qty: z.number().int().min(1).max(MAX_QTY),
});

const paymentIds = site.payment.methods.map((m) => m.id) as [string, ...string[]];

export const orderSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Coșul este gol.").max(MAX_LINES),
  name,
  phone,
  email,
  county: z.enum(COUNTIES, { error: "Alege județul." }),
  city: z.string().trim().min(2, "Scrie localitatea.").max(80),
  address: z.string().trim().min(6, "Scrie adresa completă (stradă, număr, bloc, apartament).").max(200),
  postalCode: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{6}$/.test(v), "Codul poștal are 6 cifre.")
    .optional()
    .default(""),
  notes: z.string().trim().max(500, "Maximum 500 de caractere.").optional().default(""),
  payment: z.enum(paymentIds, { error: "Alege metoda de plată." }),
  terms: consent,
  /** Honeypot — real visitors never see or fill this. */
  website: z.string().max(0).optional().default(""),
});
export type OrderInput = z.input<typeof orderSchema>;

export const contactSchema = z.object({
  name,
  email,
  phone: z.union([z.literal(""), phone]).optional().default(""),
  topic: z.enum(["produse", "comanda", "colaborare", "altceva"], { error: "Alege un subiect." }),
  message: z.string().trim().min(10, "Mesajul e prea scurt (minimum 10 caractere).").max(2000, "Maximum 2000 de caractere."),
  privacy: consent,
  website: z.string().max(0).optional().default(""),
});
export type ContactInput = z.input<typeof contactSchema>;

/** First error message per field, from a zod error — used by both forms and APIs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}

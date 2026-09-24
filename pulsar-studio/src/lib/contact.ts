import { siteConfig } from "@/lib/constants";

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  budget: string;
  message: string;
};

/**
 * Site-ul e export static: nu are server, deci nu are unde să primească un
 * POST. Până acum, trimiterea formularului arunca pur și simplu — adică
 * butonul principal al paginii nu funcționa.
 *
 * Varianta de aici chiar livrează: compune mesajul și îl deschide în
 * aplicația de email a vizitatorului, cu destinatarul, subiectul și tot
 * conținutul deja completate. Nu e elegant, dar ajunge la tine, funcționează
 * pe orice găzduire și nu pretinde că există un backend.
 *
 * CÂND AI UN ENDPOINT REAL (funcție serverless, Formspree, Web3Forms):
 * înlocuiește corpul funcției cu fetch-ul către el și șterge `openMailClient`.
 * Restul paginii nu trebuie atins — tot ce știe este că funcția rezolvă sau
 * aruncă.
 */

function buildMessage(payload: ContactPayload) {
  const lines = [
    `Nume: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Telefon: ${payload.phone}` : null,
    payload.company ? `Firmă: ${payload.company}` : null,
    payload.projectType ? `Tip proiect: ${payload.projectType}` : null,
    payload.budget ? `Buget estimat: ${payload.budget}` : null,
    "",
    "Mesaj:",
    payload.message,
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}

export function buildWhatsAppUrl(payload: ContactPayload) {
  return `https://wa.me/${siteConfig.phoneHref.replace("+", "")}?text=${encodeURIComponent(buildMessage(payload))}`;
}

export function buildMailtoUrl(payload: ContactPayload) {
  const subject = `Cerere ofertă — ${payload.projectType || "proiect nou"}`;
  return (
    `mailto:${siteConfig.email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(buildMessage(payload))}`
  );
}

export async function submitContactForm(payload: ContactPayload): Promise<{ ok: true }> {
  if (typeof window === "undefined") throw new Error("NO_WINDOW");
  window.location.href = buildMailtoUrl(payload);
  return { ok: true };
}

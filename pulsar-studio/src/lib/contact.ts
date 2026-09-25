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

/*
 * Formularul trimite mesajul pe WhatsApp prin CallMeBot.
 *
 * Site-ul e export static: nu are server care să primească un POST. CallMeBot
 * e un API cu GET simplu, deci merge chemat direct din browser.
 *
 * DE ȘTIUT, ca să nu fie o surpriză mai târziu:
 *
 * 1. Cheia de mai jos ajunge în codul livrat browserului. Oricine deschide
 *    codul paginii o poate citi și îți poate trimite mesaje pe WhatsApp prin
 *    ea. Nu-ți dă acces nimeni la nimic, dar e o portiță de spam. Singura
 *    rezolvare adevărată e un mic releu pe server (funcție pe Vercel sau
 *    Cloudflare) care ține cheia la el; atunci se schimbă doar `ENDPOINT`.
 *
 * 2. CallMeBot nu trimite anteturi CORS, deci cererea pleacă cu `no-cors` și
 *    răspunsul lor nu poate fi citit din pagină. Știm dacă cererea a plecat,
 *    nu dacă ei au livrat-o. De asta pagina de confirmare păstrează și
 *    telefonul, și emailul: dacă mesajul nu ajunge, omul are ce face.
 *
 * 3. CallMeBot limitează frecvența. Două trimiteri una după alta pot fi
 *    ignorate de ei — nu e o eroare a site-ului.
 */

const CALLMEBOT = {
  /** Numărul care primește mesajele, în format internațional. */
  phone: siteConfig.phoneHref,
  /** Cheia personală obținută de la CallMeBot pe WhatsApp. */
  apikey: "9102404",
  endpoint: "https://api.callmebot.com/whatsapp.php",
};

/** CallMeBot taie mesajele foarte lungi; tăiem noi, ca să nu ne taie ei. */
const MAX_LENGTH = 900;

function buildMessage(payload: ContactPayload) {
  const lines = [
    "Cerere ofertă — crearewebsitepro.ro",
    "",
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

  const text = lines.join("\n");
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1)}…` : text;
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
  const url =
    `${CALLMEBOT.endpoint}` +
    `?phone=${encodeURIComponent(CALLMEBOT.phone)}` +
    `&text=${encodeURIComponent(buildMessage(payload))}` +
    `&apikey=${encodeURIComponent(CALLMEBOT.apikey)}`;

  // `no-cors` întoarce un răspuns opac: se rezolvă dacă cererea a plecat și
  // aruncă dacă rețeaua a refuzat-o. E tot semnalul pe care îl putem avea.
  await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store" });
  return { ok: true };
}

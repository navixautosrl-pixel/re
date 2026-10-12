import { site } from "@/config/site";
import { Placeholder } from "@/components/Placeholder";

export const telHref = () => (site.phone ? `tel:${site.phone}` : undefined);
export const waHref = (text?: string) =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}` : undefined;

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);

/** Call + WhatsApp. Until the number is configured, a visible placeholder replaces the link. */
export function CallButtons({ text, size = "md", className = "", quiet }: { text?: string; size?: "md" | "lg"; className?: string; quiet?: boolean }) {
  const tel = telHref();
  const wa = waHref(text);
  const big = size === "lg" ? "min-h-14 px-6 text-[length:var(--step-1)]" : "";
  const call = quiet ? "btn btn-line" : "btn btn-beacon";
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {tel ? (
        <a href={tel} className={`${call} ${big}`}>
          <PhoneIcon /> Sună: {site.phoneDisplay ?? site.phone}
        </a>
      ) : (
        <span className={`${call} ${big}`} aria-disabled="true">
          <PhoneIcon /> Sună acum <Placeholder field="phone">telefon</Placeholder>
        </span>
      )}
      {wa ? (
        <a href={wa} className={`btn btn-line ${big}`} rel="noopener">
          <WaIcon /> WhatsApp
        </a>
      ) : (
        <span className={`btn btn-line ${big}`} aria-disabled="true">
          <WaIcon /> WhatsApp <Placeholder field="whatsapp">număr</Placeholder>
        </span>
      )}
    </div>
  );
}

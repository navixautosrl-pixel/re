import Link from "next/link";
import { LANDINGS, PRIMARY_ZONES, type Landing } from "@/data/landings";

/** Cards linking to landing pages. The client's main areas are highlighted in road-sign blue. */
export function LandingCards({ group, slugs, exclude = [], headingLevel = "h3" }: { group?: Landing["group"]; slugs?: string[]; exclude?: string[]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const items = slugs
    ? (slugs.map((s) => LANDINGS.find((l) => l.slug === s)).filter(Boolean) as Landing[])
    : LANDINGS.filter((l) => l.group === group && !exclude.includes(l.slug));
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((l) => {
        const main = PRIMARY_ZONES.includes(l.slug);
        return (
          <li key={l.slug}>
            <Link
              href={`/${l.slug}/`}
              className={`group flex h-full flex-col rounded-[var(--radius-l)] p-5 ring-1 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(20,30,50,.5)] ${main ? "bg-sign text-white ring-sign" : "bg-card ring-rule hover:ring-sign"}`}
            >
              <H className="text-[length:var(--step-1)] font-[800] tracking-normal">{l.nav}</H>
              <span className={`mt-2 text-[length:var(--step--1)] ${main ? "text-white/85" : "text-ink-2"}`}>{l.lead}</span>
              <span className={`mt-auto pt-3 font-[700] ${main ? "text-white underline underline-offset-4" : "text-sign"}`}>Detalii și preț</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

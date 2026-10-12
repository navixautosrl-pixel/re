import Link from "next/link";
import { LANDINGS, type Landing } from "@/data/landings";

export function LandingCards({ group, headingLevel = "h3" }: { group: Landing["group"]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {LANDINGS.filter((l) => l.group === group).map((l) => (
        <li key={l.slug}>
          <Link href={`/${l.slug}/`} className="group flex h-full flex-col rounded-[var(--radius-l)] bg-card p-5 ring-1 ring-rule transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(20,30,50,.5)] hover:ring-sign">
            <H className="text-[length:var(--step-1)] font-[800] tracking-normal">{l.nav}</H>
            <span className="mt-2 text-[length:var(--step--1)] text-ink-2">{l.lead}</span>
            <span className="mt-auto pt-3 font-[700] text-sign">Detalii și preț</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

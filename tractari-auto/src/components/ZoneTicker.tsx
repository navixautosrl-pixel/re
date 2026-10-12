import Link from "next/link";

const ZONES = [
  ["Chiajna", "/tractari-chiajna/"], ["Militari", "/tractari-militari/"], ["A1 București–Pitești", "/tractari-autostrada-bucuresti-pitesti/"],
  ["Centura București", "/tractari-centura-bucuresti/"], ["Dragomirești-Vale", "/tractari-dragomiresti-vale/"], ["Ciorogârla", "/tractari-ciorogarla/"],
  ["Domnești", "/tractari-domnesti/"], ["Sectorul 6", "/tractari-sector-6/"], ["Bragadiru", "/tractari-bragadiru/"], ["Non-stop 24/7", "/tractari-non-stop-bucuresti/"],
] as const;

/** Infinite zones ticker (CSS only). The list is rendered twice for a seamless loop; the copy is hidden from AT. */
export function ZoneTicker() {
  const row = (hidden: boolean) =>
    ZONES.map(([name, href]) => (
      <li key={`${hidden}-${href}`} className="flex items-center gap-2.5 whitespace-nowrap">
        <span aria-hidden="true" className="size-2 rounded-full bg-beacon" />
        <Link href={href} tabIndex={hidden ? -1 : undefined} className="text-[length:var(--step-1)] font-[800] text-paint/90 hover:text-beacon">{name}</Link>
      </li>
    ));
  return (
    <nav data-anim aria-label="Zone deservite" className="on-dark ticker-mask border-y border-white/10 bg-asphalt py-4">
      <div className="ticker">
        <ul className="flex gap-10">{row(false)}</ul>
        <ul className="flex gap-10" aria-hidden="true">{row(true)}</ul>
      </div>
    </nav>
  );
}

import Link from "next/link";
import { byId, type VehicleId } from "@/config/pricing";
import { formatLei, quote } from "@/lib/quote";

/** Example prices, computed at build time from the same tariff as the calculator — never typed in. */
export function ExampleTable({ vehicle = "hatchback", kms }: { vehicle?: VehicleId; kms: number[] }) {
  const v = byId(vehicle)!;
  return (
    <div className="overflow-hidden rounded-[var(--radius-l)] bg-card ring-1 ring-rule">
      <table className="tabular w-full text-left">
        <caption className="px-5 pt-4 text-left font-[750] text-ink">Exemple de preț — {v.name}</caption>
        <thead className="text-[length:var(--step--1)] text-ink-2">
          <tr className="border-b border-rule">
            <th scope="col" className="px-5 py-3 font-[700]">Distanța traseului</th>
            <th scope="col" className="px-5 py-3 text-right font-[700]">Preț estimat</th>
            <th scope="col" className="px-5 py-3 text-right font-[700]"><span className="sr-only">Deschide în calculator</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {kms.map((km) => (
            <tr key={km}>
              <th scope="row" className="px-5 py-3 font-[650]">{km} km</th>
              <td className="px-5 py-3 text-right font-[800]">{formatLei(quote(v, km).total)}{quote(v, km).band === "short" && <span className="block text-[0.75rem] font-[600] text-ink-2">cu încărcare și descărcare</span>}</td>
              <td className="px-5 py-3 text-right"><Link className="link text-[length:var(--step--1)]" href={`/calculator/?vehicul=${v.id}&km=${km}`}>Vezi calculul<span className="sr-only"> pentru {km} km</span></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-rule px-5 py-3 text-[length:var(--step--1)] text-ink-2">Distanțe exemplificative; prețul final se calculează pe kilometrii reali ai traseului tău și se confirmă la telefon.</p>
    </div>
  );
}

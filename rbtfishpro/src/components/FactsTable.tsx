import Link from "next/link";
import { products, RANGES } from "@/data/products";

/** "Ce scrie pe pungă": only what the client's packaging/poster states. Unknown = said plainly. */
export function FactsTable() {
  const noPreservatives = (slug: string) => products.find((p) => p.slug === slug)?.verifiedFacts.includes("Fără conservanți");
  return (
    <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-white/10" role="region" aria-labelledby="facts-title" tabIndex={0}>
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <caption className="sr-only">Comparație între cele patru rețete RbtFishPro, după informațiile de pe ambalaj</caption>
        <thead className="bg-night-2 text-mist-2">
          <tr>
            <th scope="col" className="px-5 py-4 font-semibold">Rețetă</th>
            <th scope="col" className="px-5 py-4 font-semibold">Bază</th>
            <th scope="col" className="px-5 py-4 font-semibold">Aromă</th>
            <th scope="col" className="px-5 py-4 font-semibold">Conservanți</th>
            <th scope="col" className="px-5 py-4 font-semibold">Diametre</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {products.map((p) => (
            <tr key={p.slug}>
              <th scope="row" className="px-5 py-4">
                <Link href={`/produse/${p.slug}`} className="link font-semibold">{p.name}</Link>
              </th>
              <td className="px-5 py-4">{RANGES[p.range].label}</td>
              <td className="px-5 py-4">{p.flavour}</td>
              <td className="px-5 py-4">{noPreservatives(p.slug) ? "Fără" : <span className="text-mist-2">nespecificat pe ambalaj</span>}</td>
              <td className="tabular px-5 py-4">{p.diameters.join(" / ")} mm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

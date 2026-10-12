import Link from "next/link";
import { PRICING, VEHICLES } from "@/config/pricing";
import { RatesTable } from "@/components/RatesTable";
import { CallButtons } from "@/components/CallButtons";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { formatLei, quote } from "@/lib/quote";

export const metadata = pageMeta({
  title: "Tarife tractări auto București — preț pe km",
  description: "Cât costă o tractare în București: tarife pe km pentru moto, autoturism, SUV, microbuz și autoutilitară, plus exemple calculate de la 10 la 457 km.",
  path: "/tarife-tractari/",
});

const KMS = [10, 30, 60, 120, 250, 457];

export default function Tarife() {
  return (
    <div className="pb-20 pt-24 md:pt-28">
      <div className="wrap">
        <h1 className="max-w-[18ch] text-[length:var(--step-4)]">Cât costă o tractare</h1>
        <p className="mt-4 max-w-[58ch] text-[length:var(--step-1)] text-ink-2">
          Prețul depinde de două lucruri: ce vehicul transportăm și câți kilometri are traseul. Aici sunt toate tarifele, formula și exemple calculate — aceleași pe care le folosește <Link href="/calculator/" className="link">calculatorul</Link>.
        </p>

        <section aria-labelledby="rates-title" className="mt-12">
          <h2 id="rates-title" className="text-[length:var(--step-2)]">Tarife pe kilometru</h2>
          <div className="mt-5"><RatesTable /></div>
        </section>

        <section aria-labelledby="formula" className="prose-road mt-14">
          <h2 id="formula" className="text-[length:var(--step-2)] text-ink">Cum se calculează prețul</h2>
          <ol>
            <li>Primii {PRICING.extraKm} km ai traseului × tariful Extra-City al vehiculului.</li>
            <li>Restul kilometrilor × tariful Intra-City.</li>
            <li>Suma se înmulțește cu coeficientul tarifar ×{PRICING.multiplier.toLocaleString("ro-RO")}.</li>
            <li>Prețul minim al unei curse este {PRICING.minTotal} lei: pentru trasee scurte, plătești minimul.</li>
            <li>Staționarea: primele {PRICING.freeWaitMinutes} de minute sunt gratuite, apoi {PRICING.waitPerHour} lei pe oră.</li>
            <li>Pentru mașini avariate cu roți blocate se adaugă un supliment, confirmat la telefon.</li>
          </ol>
        </section>

        <section aria-labelledby="ex" className="mt-14">
          <h2 id="ex" className="text-[length:var(--step-2)]">Exemple calculate</h2>
          <p className="mt-2 text-ink-2">Distanțe exemplificative; prețul final se calculează pe kilometrii reali ai traseului.</p>
          <div className="mt-5 overflow-x-auto rounded-[var(--radius-l)] bg-card ring-1 ring-rule" role="region" aria-labelledby="ex" tabIndex={0}>
            <table className="tabular w-full min-w-[44rem] text-right">
              <thead className="text-[length:var(--step--1)] text-ink-2">
                <tr className="border-b border-rule">
                  <th scope="col" className="px-4 py-3 text-left font-[700]">Vehicul</th>
                  {KMS.map((k) => <th key={k} scope="col" className="px-4 py-3 font-[700]">{k} km</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {VEHICLES.map((v) => (
                  <tr key={v.id}>
                    <th scope="row" className="px-4 py-3 text-left font-[750]">{v.name}</th>
                    {KMS.map((k) => <td key={k} className="px-4 py-3">{formatLei(quote(v, k).total)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <CallButtons className="mt-12" size="lg" />
      </div>
      <JsonLd data={breadcrumbLd([{ name: "Acasă", path: "/" }, { name: "Tarife", path: "/tarife-tractari/" }])} />
    </div>
  );
}

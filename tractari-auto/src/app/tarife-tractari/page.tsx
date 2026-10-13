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

        <section aria-labelledby="short-t" className="mt-14">
          <h2 id="short-t" className="text-[length:var(--step-2)]">Curse scurte, în oraș</h2>
          <div className="mt-5 overflow-x-auto rounded-[var(--radius-l)] bg-card ring-1 ring-rule" role="region" aria-labelledby="short-t" tabIndex={0}>
            <table className="tabular w-full text-right">
              <thead className="text-[length:var(--step--1)] text-ink-2">
                <tr className="border-b border-rule">
                  <th scope="col" className="px-4 py-3 text-left font-[700]">Vehicul</th>
                  <th scope="col" className="px-4 py-3 font-[700]">Tarif urban<span className="block font-normal">lei/km</span></th>
                  <th scope="col" className="px-4 py-3 font-[700]">Taxă încărcare</th>
                  <th scope="col" className="px-4 py-3 font-[700]">Taxă descărcare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {VEHICLES.map((v) => (
                  <tr key={v.id}>
                    <th scope="row" className="px-4 py-3 text-left font-[750]">{v.name}</th>
                    <td className="px-4 py-3">{v.short.intraRate.toLocaleString("ro-RO", { minimumFractionDigits: 1 })}</td>
                    <td className="px-4 py-3">{v.short.loadFee} lei</td>
                    <td className="px-4 py-3">{v.short.unloadFee} lei</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="mid-t" className="mt-14">
          <h2 id="mid-t" className="text-[length:var(--step-2)]">Curse în afara orașului, cu taxe de încărcare</h2>
          <p className="mt-2 max-w-[65ch] text-ink-2">Peste {PRICING.shortMaxKm} km se aplică tariful regional de mai jos sau tariful pe kilometru, oricare iese mai mare. Pe distanțe medii (de exemplu Chiajna → Giurgiu sau Ploiești) iese tariful regional.</p>
          <div className="mt-5 overflow-x-auto rounded-[var(--radius-l)] bg-card ring-1 ring-rule" role="region" aria-labelledby="mid-t" tabIndex={0}>
            <table className="tabular w-full text-right">
              <thead className="text-[length:var(--step--1)] text-ink-2">
                <tr className="border-b border-rule">
                  <th scope="col" className="px-4 py-3 text-left font-[700]">Vehicul</th>
                  <th scope="col" className="px-4 py-3 font-[700]">Intra-City<span className="block font-normal">lei/km</span></th>
                  <th scope="col" className="px-4 py-3 font-[700]">Extra-City<span className="block font-normal">lei/km</span></th>
                  <th scope="col" className="px-4 py-3 font-[700]">Taxă încărcare</th>
                  <th scope="col" className="px-4 py-3 font-[700]">Taxă descărcare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {VEHICLES.map((v) => (
                  <tr key={v.id}>
                    <th scope="row" className="px-4 py-3 text-left font-[750]">{v.name}</th>
                    <td className="px-4 py-3">{v.mid.intraRate.toLocaleString("ro-RO", { minimumFractionDigits: 1 })}</td>
                    <td className="px-4 py-3">{v.extraRate.toLocaleString("ro-RO", { minimumFractionDigits: 1 })}</td>
                    <td className="px-4 py-3">{v.short.loadFee} lei</td>
                    <td className="px-4 py-3">{v.mid.unloadFee} lei</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="formula" className="prose-road mt-14">
          <h2 id="formula" className="text-[length:var(--step-2)] text-ink">Cum se calculează prețul</h2>
          <ol>
            <li>Curse scurte, în oraș (până la {PRICING.shortMaxKm} km): toți kilometrii cu tariful urban, plus taxa de încărcare și taxa de descărcare.</li>
            <li>Curse în afara orașului: kilometrii cu tariful regional (Intra-City), {PRICING.midExtraKm} km Extra-City, plus taxa de încărcare și taxa de descărcare.</li>
            <li>Curse lungi: primii {PRICING.extraKm} km × tariful Extra-City, restul × tariful Intra-City din tabelul de tarife pe kilometru. Peste {PRICING.shortMaxKm} km se aplică varianta care iese mai mare dintre aceasta și cea regională.</li>
            <li>Staționarea: primele {PRICING.freeWaitMinutes} de minute sunt gratuite, apoi {PRICING.waitPerHour} lei pe oră.</li>
            <li>Mașini avariate cu roți blocate: taxa de manipulare cu căruciorul, {PRICING.lockedWheelFee} lei pentru fiecare roată blocată.</li>
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

import { PRICING, VEHICLES } from "@/config/pricing";
import { formatRate } from "@/lib/quote";

export function RatesTable() {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-l)] bg-card ring-1 ring-rule" role="region" aria-labelledby="rates-title" tabIndex={0}>
      <table className="tabular w-full text-left">
        <caption className="sr-only">Tarife pe kilometru pentru fiecare tip de vehicul</caption>
        <thead className="text-[length:var(--step--1)] text-ink-2">
          <tr className="border-b border-rule">
            <th scope="col" className="px-5 py-4 font-[700]">Vehicul</th>
            <th scope="col" className="hidden px-5 py-4 font-[700] sm:table-cell">Greutate</th>
            <th scope="col" className="px-5 py-4 text-right font-[700]">Intra-City<span className="block font-normal">lei/km</span></th>
            <th scope="col" className="px-5 py-4 text-right font-[700]">Extra-City<span className="block font-normal">lei/km</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {VEHICLES.map((v) => (
            <tr key={v.id}>
              <th scope="row" className="px-4 py-3 sm:px-5">
                <span className="flex items-center gap-3 font-[750]">
                  <span>{v.name}<span className="block text-[0.78rem] font-normal text-ink-2 sm:hidden">{v.weight.replace("Între ", "").replace(" și ", "–")}</span></span>
                </span>
              </th>
              <td className="hidden px-5 py-3 text-ink-2 sm:table-cell">{v.weight}</td>
              <td className="px-3 py-3 text-right font-[700] sm:px-5">{formatRate(v.intraRate)}</td>
              <td className="px-3 py-3 text-right font-[700] sm:px-5">{formatRate(v.extraRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-rule px-5 py-3 text-[length:var(--step--1)] text-ink-2">
        Tarife pentru curse lungi: primii {PRICING.extraKm} km cu tariful Extra-City, restul cu Intra-City. Curse scurte (până la {PRICING.shortMaxKm} km): tariful urban plus taxele de încărcare și descărcare din tabelul de mai jos. Totalul se înmulțește cu coeficientul tarifar ×{PRICING.multiplier.toLocaleString("ro-RO")}. Staționarea: {PRICING.freeWaitMinutes} min gratuit, apoi {PRICING.waitPerHour} lei/oră.
      </p>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { PRICING } from "@/config/pricing";
import { site } from "@/config/site";

export const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Cum se calculează prețul?",
    a: (
      <>
        Din tipul vehiculului și distanța traseului. În oraș și pe distanțe medii se plătesc kilometrii plus taxa de încărcare și de descărcare; pe curse lungi, primii {PRICING.extraKm} km cu tariful Extra-City și restul cu Intra-City. Totalul îl vezi
        imediat în calculator. Toate tarifele sunt în <Link className="link" href="/#tarife">tabelul de tarife</Link>.
      </>
    ),
  },
  {
    q: "Cât costă o cursă scurtă, în oraș?",
    a: `Pentru curse de până la ${PRICING.shortMaxKm} km se plătesc taxa de încărcare și taxa de descărcare (de la 90 la 200 lei fiecare, după vehicul) plus kilometrii cu tariful urban, Totalul îl vezi direct în calculator. Exemplu: un sedan pe 3 km costă aproximativ 274 lei.`,
  },
  {
    q: "Aveți reducere la cursele lungi?",
    a: `Da. La cursele în afara orașului, de peste ${PRICING.shortMaxKm} km, scădem automat din taxa de descărcare între 30 și 70 de lei, după vehicul (la SUV, 40 de lei). Reducerea apare în calculator, pe rândul „Reducere cursă lungă”.`,
  },
  {
    q: "Prețul din calculator este final?",
    a: "Este un preț estimativ, calculat după distanța pe drum. Îl confirmăm la telefon, în funcție de starea mașinii și de condițiile de încărcare.",
  },
  {
    q: "Ce înseamnă staționarea?",
    a: `Timpul în care platforma așteaptă la încărcare sau descărcare. Primele ${PRICING.freeWaitMinutes} de minute sunt gratuite; după aceea, tariful este ${PRICING.waitPerHour} lei pe oră.`,
  },
  {
    q: "Transportați și mașini avariate?",
    a: `Da. Bifează „Mașină avariată (roți blocate)” în calculator: alegi câte roți sunt blocate, iar taxa de manipulare cu căruciorul este de ${PRICING.lockedWheelFee} lei pentru fiecare roată.`,
  },
  {
    q: "Ce documente trebuie să am?",
    a: "Talonul mașinii, actul de identitate și nota de comandă; pentru mașinile cumpărate de la dealeri sau parcuri auto, și factura de achiziție.",
  },
  {
    q: "În cât timp ajunge platforma?",
    a: "Depinde de zonă, de trafic și de locul de unde pleacă cea mai apropiată platformă disponibilă. Suntem dispecerat și lucrăm cu mai multe platforme partenere, așa că trimitem mereu pe cea mai apropiată liberă; timpul estimat ți-l spunem la telefon, înainte de confirmare.",
  },
  {
    q: "Sunteți firmă de tractări sau dispecerat?",
    a: "Suntem dispecerat non-stop: preluăm comanda, îți dăm prețul și trimitem cea mai apropiată platformă parteneră disponibilă. Transportul îl face firma parteneră, la tarifele afișate pe site.",
  },
  {
    q: "Cum se plătește?",
    a: "Numerar (cash), la finalul transportului, sau transfer bancar. La cerere, emitem factură pe persoană fizică sau juridică.",
  },
  {
    q: "În ce zone lucrați?",
    a: `${site.serviceArea}. Pentru curse lungi mergem oriunde în țară, la cerere.`,
  },
];

export function FaqList() {
  return (
    <div className="divide-y divide-rule rounded-[var(--radius-l)] bg-card ring-1 ring-rule">
      {FAQ.map((f) => (
        <details key={f.q} className="group px-5">
          <summary className="flex min-h-16 items-center justify-between gap-5 py-4">
            <h3 className="text-[length:var(--step-1)] font-[750] leading-snug tracking-normal">{f.q}</h3>
            <svg className="chev shrink-0 text-sign" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="max-w-[65ch] pb-5 text-ink-2">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

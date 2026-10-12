import Link from "next/link";
import type { ReactNode } from "react";
import { PRICING } from "@/config/pricing";
import { site } from "@/config/site";
import { Placeholder } from "@/components/Placeholder";

export const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Cum se calculează prețul?",
    a: (
      <>
        Din tipul vehiculului și distanța traseului: primii {PRICING.extraKm} km cu tariful Extra-City, restul cu tariful Intra-City, totul înmulțit cu
        coeficientul tarifar ×{PRICING.multiplier.toLocaleString("ro-RO")}. Toate tarifele sunt în <Link className="link" href="/#tarife">tabelul de tarife</Link>.
      </>
    ),
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
    a: "Da. Bifează „Mașină avariată (roți blocate)” în calculator: încărcarea cere echipament suplimentar, iar suplimentul se confirmă la telefon.",
  },
  {
    q: "Ce documente trebuie să am?",
    a: "Talonul mașinii, actul de identitate și nota de comandă; pentru mașinile cumpărate de la dealeri sau parcuri auto, și factura de achiziție.",
  },
  {
    q: "În cât timp ajunge platforma?",
    a: <Placeholder field="faq.eta">timpul obișnuit de sosire, doar dacă îl puteți garanta</Placeholder>,
  },
  {
    q: "Cum se plătește?",
    a: <Placeholder field="faq.payment">metodele de plată acceptate (numerar, card, transfer, factură)</Placeholder>,
  },
  {
    q: "În ce zone lucrați?",
    a: site.serviceArea ?? <Placeholder field="serviceArea">zona acoperită</Placeholder>,
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

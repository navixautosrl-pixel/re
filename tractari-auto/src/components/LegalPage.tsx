import type { ReactNode } from "react";
import { site } from "@/config/site";
import { Placeholder } from "@/components/Placeholder";

export function Operator() {
  return (
    <>
      {site.legalName ?? <Placeholder field="legalName">denumirea firmei</Placeholder>}, CUI {site.company.cui ?? <Placeholder field="company.cui">CUI</Placeholder>},
      sediul {site.company.address ?? <Placeholder field="company.address">adresa</Placeholder>}, telefon {site.phoneDisplay ?? <Placeholder field="phone">telefon</Placeholder>}
    </>
  );
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="wrap pb-20 pt-24 md:pt-28">
      <h1 className="text-[length:var(--step-3)]">{title}</h1>
      <p role="note" className="mt-5 max-w-3xl rounded-[var(--radius-m)] border-2 border-dashed border-[#b7791f] bg-[#fff7e6] p-4 text-[#8a5a10]">
        Draft de verificat de un jurist înainte de lansare; datele firmei se completează în configurare.
      </p>
      <div className="mt-8 max-w-[68ch] space-y-4 text-ink-2 [&_h2]:pt-4 [&_h2]:text-[length:var(--step-1)] [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </div>
  );
}

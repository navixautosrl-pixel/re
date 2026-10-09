import type { ReactNode } from "react";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Placeholder } from "@/components/Placeholder";

/** Operator identity, always from config — never typed into page copy. */
export function Operator() {
  const c = site.company;
  return (
    <>
      {site.legalName ?? <Placeholder field="legalName">denumirea firmei</Placeholder>}, cu sediul în {c.hq ?? <Placeholder field="company.hq">adresa sediului social</Placeholder>},
      CUI {c.cui ?? <Placeholder field="company.cui">CUI</Placeholder>}, nr. Reg. Com. {c.regCom ?? <Placeholder field="company.regCom">J…/…/…</Placeholder>}, e-mail{" "}
      {site.contact.email ?? <Placeholder field="contact.email">e-mail</Placeholder>}, telefon {site.contact.phone ?? <Placeholder field="contact.phone">telefon</Placeholder>}
    </>
  );
}

export function LegalPage({ title, path, updated, children }: { title: string; path: string; updated: string; children: ReactNode }) {
  return (
    <div className="wrap pb-24 pt-24">
      <Breadcrumbs items={[{ name: title, path }]} />
      <h1 className="display mt-6 text-[length:var(--step-4)]">{title}</h1>
      <p role="note" className="mt-6 max-w-3xl rounded-[var(--radius-panel)] border-[1.5px] border-dashed border-lamp p-5 text-lamp">
        Draft pregătit pentru verificare juridică. Datele firmei și termenele marcate trebuie completate de RbtFishPro, iar textul verificat de un jurist
        înainte de lansare. Ultima actualizare: {updated}.
      </p>
      <div className="legal measure mt-10 space-y-5 text-mist-2 [&_h2]:font-display [&_h2]:font-bold [&_h2]:italic [&_h2]:uppercase [&_h2]:leading-none [&_h2]:pt-6 [&_h2]:text-[length:var(--step-2)] [&_h2]:text-mist [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-mist [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}

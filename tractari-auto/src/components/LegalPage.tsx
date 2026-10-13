import type { ReactNode } from "react";
import { site } from "@/config/site";

export function Operator() {
  const c = site.company;
  return (
    <>
      {site.legalName}, cu sediul în {c.address}, înregistrată la Registrul Comerțului sub nr. {c.regCom}, EUID {c.euid}, CUI {c.cui}, telefon{" "}
      <a className="link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
      {site.email && <>, e-mail <a className="link" href={`mailto:${site.email}`}>{site.email}</a></>}
    </>
  );
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="wrap pb-20 pt-24 md:pt-28">
      <h1 className="text-[length:var(--step-3)]">{title}</h1>
      <p className="mt-3 text-ink-2">Ultima actualizare: {updated}</p>
      <div className="mt-8 max-w-[70ch] space-y-4 text-ink-2 [&_h2]:pt-6 [&_h2]:text-[length:var(--step-1)] [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_strong]:text-ink">{children}</div>
    </div>
  );
}

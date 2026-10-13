import { site } from "@/config/site";
import { CallButtons } from "@/components/CallButtons";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Contact", description: `Contact ${site.name}: dispecerat non-stop, telefon și WhatsApp pentru tractări în Chiajna, Militari, București, pe Centura și pe A1.`, path: "/contact/" });

export default function Contact() {
  const c = site.company;
  const rows: [string, React.ReactNode][] = [
    ["Telefon", <a key="t" className="link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>],
    ["WhatsApp", <a key="w" className="link" href={`https://wa.me/${site.whatsapp}`} rel="noopener">+{site.whatsapp}</a>],
    ...(site.email ? [["E-mail", <a key="e" className="link" href={`mailto:${site.email}`}>{site.email}</a>] as [string, React.ReactNode]] : []),
    ["Program", "Dispecerat non-stop, 24 de ore din 24, 7 zile din 7"],
    ["Cum lucrăm", "Suntem dispecerat și colaborăm cu mai multe platforme partenere. Trimitem cea mai apropiată platformă disponibilă; timpul de sosire depinde de zonă și de locul de unde pleacă platforma și ți-l spunem la telefon."],
    ["Zona acoperită", site.serviceArea],
    ["Plata", "Numerar (cash) sau transfer bancar, cu factură"],
    ["Firma", site.legalName],
    ["Sediul social", c.address],
    ["CUI", c.cui],
    ["Nr. Reg. Com.", c.regCom],
    ["EUID", c.euid],
  ];
  return (
    <div className="wrap pb-20 pt-24 md:pt-28">
      <h1 className="text-[length:var(--step-4)]">Contact</h1>
      <p className="mt-4 max-w-[50ch] text-[length:var(--step-1)] text-ink-2">Cel mai rapid: sună sau scrie pe WhatsApp. Dacă ai calculat deja prețul, butonul WhatsApp din calculator trimite totul completat.</p>
      <CallButtons size="lg" className="mt-8" />
      <dl className="mt-12 grid max-w-3xl divide-y divide-rule rounded-[var(--radius-l)] bg-card ring-1 ring-rule">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="font-[750]">{k}</dt>
            <dd className="text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>
      <JsonLd data={breadcrumbLd([{ name: "Acasă", path: "/" }, { name: "Contact", path: "/contact/" }])} />
    </div>
  );
}

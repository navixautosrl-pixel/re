import { site } from "@/config/site";
import { CallButtons } from "@/components/CallButtons";
import { Placeholder } from "@/components/Placeholder";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Contact", description: `Telefon, WhatsApp și e-mail ${site.name}.`, path: "/contact/" });

export default function Contact() {
  const rows: [string, React.ReactNode][] = [
    ["Telefon", site.phoneDisplay ?? <Placeholder field="phone">telefon</Placeholder>],
    ["WhatsApp", site.whatsapp ? `+${site.whatsapp}` : <Placeholder field="whatsapp">număr WhatsApp</Placeholder>],
    ["E-mail", site.email ? <a className="link" href={`mailto:${site.email}`}>{site.email}</a> : <Placeholder field="email">e-mail</Placeholder>],
    ["Program", site.hours ?? <Placeholder field="hours">program</Placeholder>],
    ["Zona acoperită", site.serviceArea ?? <Placeholder field="serviceArea">zona acoperită</Placeholder>],
    ["Adresă", site.company.address ?? <Placeholder field="company.address">adresa firmei</Placeholder>],
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

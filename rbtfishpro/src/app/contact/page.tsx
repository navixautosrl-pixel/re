import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { Placeholder } from "@/components/Placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact",
  description: "Scrie-i echipei RbtFishPro despre boilies, comenzi sau colaborări.",
  path: "/contact",
});

export default function ContactPage() {
  const c = site.contact;
  return (
    <div className="wrap pb-24 pt-24">
      <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <h1 className="display text-[length:var(--step-4)]">Contact</h1>
          <p className="measure mt-4 text-[length:var(--step-1)] text-mist-2">Întrebări despre o rețetă, o comandă sau o colaborare — scrie-ne.</p>
          <dl className="mt-10 space-y-5">
            <div>
              <dt className="font-semibold">E-mail</dt>
              <dd className="mt-1">{c.email ? <a className="link" href={`mailto:${c.email}`}>{c.email}</a> : <Placeholder field="contact.email">adresa de e-mail</Placeholder>}</dd>
            </div>
            <div>
              <dt className="font-semibold">Telefon</dt>
              <dd className="mt-1">{c.phone ? <a className="link" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a> : <Placeholder field="contact.phone">numărul de telefon</Placeholder>}</dd>
            </div>
            <div>
              <dt className="font-semibold">Program</dt>
              <dd className="mt-1">{c.hours ?? <Placeholder field="contact.hours">programul de răspuns</Placeholder>}</dd>
            </div>
            <div>
              <dt className="font-semibold">Adresă</dt>
              <dd className="mt-1">{c.address ?? <Placeholder field="contact.address">adresa (sediu sau punct de lucru)</Placeholder>}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-[var(--radius-panel)] bg-night-2 p-6 sm:p-9">
          <h2 className="display-2 mb-6 text-[length:var(--step-2)]">Trimite un mesaj</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

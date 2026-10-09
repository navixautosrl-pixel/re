import Link from "next/link";
import { site } from "@/config/site";
import { Placeholder } from "@/components/Placeholder";
import { t } from "@/i18n/ro";

const LEGAL = [
  { href: "/termeni-si-conditii", label: "Termeni și condiții" },
  { href: "/politica-de-confidentialitate", label: "Confidențialitate (GDPR)" },
  { href: "/politica-cookies", label: "Cookie-uri" },
  { href: "/livrare-si-retur", label: "Livrare și retur" },
];

export function Footer() {
  const { company, contact } = site;
  return (
    <footer className="mt-auto border-t border-white/10 bg-night-2">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <p className="display text-[2rem]">
            Rbt<span className="text-cyan">Fish</span>Pro
          </p>
          <p className="mt-3 max-w-[30ch] text-mist-2">Boilies pentru pescuitul la crap. Fishmeal și Birdfood, 20 sau 24 mm.</p>
          <p className="mt-4 font-semibold">{t.product.inapt}.</p>
        </div>
        <nav aria-label="Magazin și informații">
          <h2 className="display-2 text-[1.3rem] text-mist-2">Magazin</h2>
          <ul className="mt-3 space-y-2">
            <li><Link className="link" href="/magazin">Toate boiliesurile</Link></li>
            <li><Link className="link" href="/magazin?baza=fishmeal">Fishmeal</Link></li>
            <li><Link className="link" href="/magazin?baza=birdfood">Birdfood</Link></li>
            <li><Link className="link" href="/despre-noi">Despre noi</Link></li>
            <li><Link className="link" href="/intrebari-frecvente">Întrebări frecvente</Link></li>
          </ul>
        </nav>
        <nav aria-label="Informații legale">
          <h2 className="display-2 text-[1.3rem] text-mist-2">Legal</h2>
          <ul className="mt-3 space-y-2">
            {LEGAL.map((l) => (
              <li key={l.href}><Link className="link" href={l.href}>{l.label}</Link></li>
            ))}
            <li><a className="link" href="https://anpc.ro/" rel="noopener">ANPC</a></li>
            <li><a className="link" href="https://ec.europa.eu/consumers/odr" rel="noopener">Soluționarea online a litigiilor (SOL)</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="display-2 text-[1.3rem] text-mist-2">Contact și firmă</h2>
          <dl className="mt-3 space-y-2 text-[length:var(--step--1)]">
            <div><dt className="sr-only">E-mail</dt><dd>{contact.email ? <a className="link" href={`mailto:${contact.email}`}>{contact.email}</a> : <Placeholder field="contact.email">e-mail</Placeholder>}</dd></div>
            <div><dt className="sr-only">Telefon</dt><dd>{contact.phone ? <a className="link" href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> : <Placeholder field="contact.phone">telefon</Placeholder>}</dd></div>
            <div><dt className="sr-only">Denumire firmă</dt><dd>{site.legalName ?? <Placeholder field="legalName">denumirea firmei</Placeholder>}</dd></div>
            <div><dt className="sr-only">CUI și Reg. Com.</dt><dd>{company.cui && company.regCom ? `CUI ${company.cui} · ${company.regCom}` : <Placeholder field="company.cui">CUI și nr. Reg. Com.</Placeholder>}</dd></div>
          </dl>
          <Link href="/contact" className="btn btn-ghost mt-5">Scrie-ne</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-5 text-[length:var(--step--1)] text-mist-2">
          © {new Date().getFullYear()} {site.name}. {site.domain}
        </p>
      </div>
    </footer>
  );
}

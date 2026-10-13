import Link from "next/link";
import { site } from "@/config/site";
import { LANDINGS } from "@/data/landings";

export function Footer() {
  const c = site.company;
  return (
    <footer className="on-dark mt-auto bg-asphalt pb-24 text-paint md:pb-0">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-[1.4rem] font-[820]">{site.name}</p>
          <p className="mt-2 max-w-[28ch] text-paint/75">Dispecerat non-stop de tractări auto: trimitem cea mai apropiată platformă parteneră disponibilă, cu prețul calculat înainte de plecare.</p>
        </div>
        <nav aria-label="Zone">
          <p className="font-[750] text-paint/70">Zone</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="link" href="/">Tractări auto București</Link></li>
            {LANDINGS.filter((l) => l.group === "zona").map((l) => <li key={l.slug}><Link className="link" href={`/${l.slug}/`}>{l.nav}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Servicii și prețuri">
          <p className="font-[750] text-paint/70">Servicii</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="link" href="/calculator/">Calculator preț</Link></li>
            <li><Link className="link" href="/tarife-tractari/">Tarife tractări</Link></li>
            {LANDINGS.filter((l) => l.group !== "zona").map((l) => <li key={l.slug}><Link className="link" href={`/${l.slug}/`}>{l.nav}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Informații legale">
          <p className="font-[750] text-paint/70">Legal</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="link" href="/contact/">Contact</Link></li>
            <li><Link className="link" href="/termeni/">Termeni și condiții</Link></li>
            <li><Link className="link" href="/politica-de-confidentialitate/">Confidențialitate</Link></li>
            <li><a className="link" href="https://anpc.ro/" rel="noopener">ANPC</a></li>
          </ul>
        </nav>
        <div className="space-y-2 text-[length:var(--step--1)]">
          <p className="font-[750] text-paint/70">Firmă</p>
          <p>{site.legalName}</p>
          <p>CUI {c.cui}, Reg. Com. {c.regCom}</p>
          <p>EUID {c.euid}</p>
          <p>{c.address}</p>
          <p><a className="link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a></p>
          {site.email && <p><a className="link" href={`mailto:${site.email}`}>{site.email}</a></p>}
          <p className="text-paint/75">Plata: numerar sau transfer bancar</p>
        </div>
      </div>
      <p className="wrap border-t border-white/10 py-5 text-[length:var(--step--1)] text-paint/70">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  );
}

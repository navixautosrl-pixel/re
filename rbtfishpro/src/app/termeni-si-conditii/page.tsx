import Link from "next/link";
import { site } from "@/config/site";
import { LegalPage, Operator } from "@/components/LegalPage";
import { Placeholder } from "@/components/Placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Termeni și condiții", description: "Termenii și condițiile magazinului online RbtFishPro.", path: "/termeni-si-conditii", noindex: true });

export default function Terms() {
  return (
    <LegalPage title="Termeni și condiții" path="/termeni-si-conditii" updated="9 octombrie 2026">
      <h2>1. Cine vinde</h2>
      <p>Site-ul {site.domain} este operat de <Operator />.</p>
      <h2>2. Produsele</h2>
      <p>
        Produsele sunt momeli pentru pescuit (boilies), <strong>inapte consumului uman</strong>. Imaginile sunt cu titlu de prezentare; informațiile despre fiecare
        rețetă sunt cele de pe ambalaj.
      </p>
      <h2>3. Prețuri</h2>
      <p>
        Prețurile sunt în lei (RON). {site.catalog.vatIncluded == null ? <Placeholder field="catalog.vat">precizați dacă prețurile includ TVA</Placeholder> : site.catalog.vatIncluded ? "Prețurile includ TVA." : "Prețurile nu includ TVA."}{" "}
        Costul livrării se afișează înainte de trimiterea comenzii sau se comunică la confirmarea comenzii.
      </p>
      <h2>4. Comanda și încheierea contractului</h2>
      <p>
        Comanda se trimite din pagina <Link className="link" href="/finalizare-comanda">Finalizare comandă</Link>. După trimitere primești numărul comenzii.
        Contractul se consideră încheiat la <Placeholder field="terms.contractMoment">momentul confirmării comenzii de către vânzător (de stabilit)</Placeholder>.
      </p>
      <h2>5. Plata</h2>
      <ul>
        {site.payment.methods.map((m) => <li key={m.id}>{m.label}{m.confirmed ? "" : " — de confirmat"}</li>)}
      </ul>
      <p>Site-ul nu procesează plăți cu cardul.</p>
      <h2>6. Livrarea</h2>
      <p>Condițiile de livrare sunt în <Link className="link" href="/livrare-si-retur">Livrare și retur</Link>.</p>
      <h2>7. Dreptul de retragere</h2>
      <p>
        Consumatorii au dreptul de a se retrage din contract în 14 zile, fără a preciza motivele, conform OUG nr. 34/2014. Procedura și excepțiile sunt descrise în{" "}
        <Link className="link" href="/livrare-si-retur">Livrare și retur</Link>.
      </p>
      <h2>8. Conformitatea produselor</h2>
      <p>Produsele beneficiază de garanția legală de conformitate, conform legislației privind vânzarea de bunuri către consumatori (OUG nr. 140/2021).</p>
      <h2>9. Reclamații și litigii</h2>
      <p>
        Reclamațiile se trimit la datele de contact de mai sus. Poți apela și la{" "}
        <a className="link" href="https://anpc.ro/" rel="noopener">ANPC</a> sau la platforma europeană{" "}
        <a className="link" href="https://ec.europa.eu/consumers/odr" rel="noopener">SOL</a>.
      </p>
      <h2>10. Date personale</h2>
      <p>Prelucrarea datelor este descrisă în <Link className="link" href="/politica-de-confidentialitate">Politica de confidențialitate</Link>.</p>
    </LegalPage>
  );
}

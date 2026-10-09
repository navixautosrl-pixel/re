import Link from "next/link";
import { LegalPage, Operator } from "@/components/LegalPage";
import { Placeholder } from "@/components/Placeholder";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Politica de confidențialitate", description: "Cum prelucrează RbtFishPro datele personale (GDPR).", path: "/politica-de-confidentialitate", noindex: true });

export default function Privacy() {
  return (
    <LegalPage title="Politica de confidențialitate" path="/politica-de-confidentialitate" updated="9 octombrie 2026">
      <h2>Operatorul datelor</h2>
      <p><Operator />.</p>
      <h2>Ce date colectăm și de ce</h2>
      <ul>
        <li><strong>Comenzi</strong>: nume, telefon, e-mail, adresă de livrare, observații — pentru a procesa și livra comanda (executarea contractului, art. 6 alin. (1) lit. b GDPR) și pentru obligațiile fiscale (art. 6 alin. (1) lit. c).</li>
        <li><strong>Formularul de contact</strong>: nume, e-mail, telefon opțional, mesaj — pentru a-ți răspunde (consimțământ, art. 6 alin. (1) lit. a, pe care îl poți retrage oricând).</li>
        <li><strong>Jurnale tehnice</strong> ale serverului (adresă IP, dată) — pentru securitate și limitarea abuzurilor (interes legitim, art. 6 alin. (1) lit. f).</li>
      </ul>
      <p>Site-ul nu folosește instrumente de analiză, publicitate sau rețele sociale încorporate. Vezi <Link className="link" href="/politica-cookies">Politica de cookie-uri</Link>.</p>
      <h2>Cui transmitem datele</h2>
      <ul>
        <li>Furnizorul de găzduire al site-ului: <Placeholder field="privacy.hosting">numele furnizorului</Placeholder></li>
        <li>Furnizorul de e-mail prin care primim comenzile și mesajele: <Placeholder field="privacy.email">de ex. Resend, dacă este folosit</Placeholder></li>
        <li>Firma de curierat, pentru livrare: <Placeholder field="privacy.courier">numele curierului</Placeholder></li>
      </ul>
      <h2>Cât timp păstrăm datele</h2>
      <p><Placeholder field="privacy.retention">perioadele de păstrare pentru comenzi, documente fiscale și mesaje</Placeholder></p>
      <h2>Drepturile tale</h2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și dreptul de a retrage consimțământul. Ne poți scrie la datele
        de contact de mai sus. Ai dreptul să depui plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (
        <a className="link" href="https://www.dataprotection.ro/" rel="noopener">ANSPDCP</a>).
      </p>
    </LegalPage>
  );
}

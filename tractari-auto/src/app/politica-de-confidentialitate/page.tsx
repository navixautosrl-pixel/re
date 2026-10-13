import Link from "next/link";
import { site } from "@/config/site";
import { LegalPage, Operator } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({ title: "Politica de confidențialitate", description: `Ce date personale folosește ${site.name}, de ce, cât timp și ce drepturi ai.`, path: "/politica-de-confidentialitate/" }),
  robots: { index: false },
};

export default function Privacy() {
  return (
    <LegalPage title="Politica de confidențialitate" updated="13 octombrie 2026">
      <p>
        Explicăm aici ce date personale folosim când vizitezi site-ul sau comanzi o tractare, de ce le folosim și ce drepturi ai, potrivit Regulamentului (UE)
        2016/679 (GDPR).
      </p>

      <h2>1. Operatorul datelor</h2>
      <p><Operator />.</p>

      <h2>2. Ce date folosim</h2>
      <ul>
        <li><strong>Când comanzi</strong> (telefon sau WhatsApp): numele, numărul de telefon, adresa sau locația de preluare și de livrare, tipul și starea vehiculului, numărul de înmatriculare și, dacă ceri factură, datele de facturare.</li>
        <li><strong>Calculatorul de preț</strong> rulează în browserul tău: vehiculul ales și distanța nu ne sunt trimise.</li>
        <li><strong>Căutarea de adrese</strong> din calculator trimite textul tastat și adresele alese către Google (Places API și Routes API), ca să calculeze traseul. Dacă introduci kilometrii manual, nu se face nicio cerere către Google. Google prelucrează aceste date conform propriei politici (<a className="link" href="https://policies.google.com/privacy" rel="noopener">policies.google.com/privacy</a>).</li>
        <li><strong>Butonul WhatsApp</strong> deschide aplicația cu un mesaj precompletat, pe care îl poți modifica. Datele ajung la noi doar dacă trimiți mesajul; WhatsApp le prelucrează conform politicii sale.</li>
        <li><strong>Jurnalele serverului</strong>: ca orice site, serverul de găzduire poate înregistra tehnic adresa IP, data și pagina accesată, pentru securitate și funcționare.</li>
      </ul>
      <p>Site-ul nu folosește cookie-uri, instrumente de analiză sau publicitate și nu are formulare care să trimită date către noi.</p>

      <h2>3. De ce și pe ce temei</h2>
      <ul>
        <li><strong>Executarea comenzii</strong> (art. 6 alin. 1 lit. b GDPR): ca să îți comunicăm prețul, să trimitem platforma și să ținem legătura cu tine.</li>
        <li><strong>Obligații legale</strong> (lit. c): emiterea documentelor fiscale și păstrarea evidențelor contabile.</li>
        <li><strong>Interes legitim</strong> (lit. f): soluționarea reclamațiilor, apărarea în caz de litigiu și securitatea site-ului.</li>
      </ul>
      <p>Nu folosim datele tale pentru reclamă și nu luăm decizii automate cu efect juridic asupra ta.</p>

      <h2>4. Cui transmitem datele</h2>
      <ul>
        <li><strong>Transportatorului partener</strong> care execută cursa: numele, telefonul, adresele și datele vehiculului, strict cât îi trebuie pentru transport.</li>
        <li>Furnizorilor de servicii (găzduire, telefonie, contabilitate), care lucrează pe baza unui contract și doar pentru scopurile de mai sus.</li>
        <li>Autorităților, numai când legea ne obligă.</li>
      </ul>
      <p>Nu vindem și nu închiriem datele personale.</p>

      <h2>5. Cât timp le păstrăm</h2>
      <p>
        Datele comenzii le păstrăm cât este necesar pentru executarea ei și pentru eventuale reclamații, apoi pe durata prevăzută de legislația
        financiar-contabilă pentru documentele fiscale. Datele care nu mai sunt necesare se șterg.
      </p>

      <h2>6. Drepturile tale</h2>
      <p>Ai dreptul:</p>
      <ul>
        <li>de acces la datele tale și de a primi o copie a lor;</li>
        <li>la rectificarea datelor inexacte;</li>
        <li>la ștergere, când datele nu mai sunt necesare sau legea o permite;</li>
        <li>la restricționarea prelucrării și la opoziție, pentru prelucrările bazate pe interes legitim;</li>
        <li>la portabilitatea datelor pe care ni le-ai furnizat;</li>
        <li>să depui plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (<a className="link" href="https://www.dataprotection.ro/" rel="noopener">dataprotection.ro</a>).</li>
      </ul>
      <p>
        Pentru oricare dintre ele, contactează-ne la <a className="link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>, pe WhatsApp
        {site.email ? <> sau la <a className="link" href={`mailto:${site.email}`}>{site.email}</a></> : null}, sau prin poștă la sediul firmei. Îți răspundem în
        cel mult o lună.
      </p>

      <h2>7. Securitate</h2>
      <p>Site-ul se încarcă doar prin conexiune criptată (HTTPS), iar datele comenzilor sunt accesibile numai persoanelor care au nevoie de ele pentru a executa cursa.</p>

      <h2>8. Modificări</h2>
      <p>Putem actualiza această politică; versiunea curentă este cea de pe această pagină. Vezi și <Link className="link" href="/termeni/">Termenii și condițiile</Link>.</p>
    </LegalPage>
  );
}

import Link from "next/link";
import { DOCUMENTS, PRICING } from "@/config/pricing";
import { site } from "@/config/site";
import { LegalPage, Operator } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({ title: "Termeni și condiții", description: `Termenii serviciului de dispecerat pentru tractări auto ${site.name}: comandă, preț, plată, anulare, răspundere și reclamații.`, path: "/termeni/" }),
  robots: { index: false },
};

export default function Terms() {
  return (
    <LegalPage title="Termeni și condiții" updated="13 octombrie 2026">
      <p>
        Acești termeni se aplică comenzilor de tractare și transport auto pe platformă făcute prin site-ul {site.url.replace("https://", "")}, telefonic sau pe
        WhatsApp. Când comanzi un transport, confirmi că i-ai citit și că ești de acord cu ei.
      </p>

      <h2>1. Cine suntem</h2>
      <p><Operator />, denumită în continuare „Dispeceratul”.</p>

      <h2>2. Ce face Dispeceratul</h2>
      <p>
        Suntem un dispecerat de tractări auto și colaborăm cu mai multe firme de transport pe platformă („transportatori parteneri”). Primim comanda ta, îți
        comunicăm prețul și trimitem la tine cea mai apropiată platformă parteneră disponibilă. Transportul propriu-zis (încărcarea, deplasarea și
        descărcarea vehiculului) este făcut de transportatorul partener, cu echipamentul și personalul lui.
      </p>
      <p>Serviciul de dispecerat funcționează non-stop, 24 de ore din 24, 7 zile din 7. Zona principală: {site.serviceArea}; curse și în restul țării, la cerere.</p>

      <h2>3. Comanda</h2>
      <ol className="space-y-2">
        <li>Ne suni la <a className="link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a> sau ne scrii pe WhatsApp, cu locul de preluare, destinația, tipul vehiculului și starea lui (pornește, are roți blocate, este avariat, se află în parcare subterană etc.).</li>
        <li>Îți comunicăm prețul și timpul estimat de sosire.</li>
        <li>Comanda este fermă din momentul în care o confirmi (verbal sau în scris, pe WhatsApp). Mesajul precompletat de pe site nu este o comandă până nu îl confirmăm noi.</li>
      </ol>
      <p>
        Informațiile pe care ni le dai trebuie să fie corecte. Dacă la fața locului situația diferă de cea descrisă (alt tip de vehicul, roți blocate nedeclarate,
        acces dificil), prețul se poate modifica; îți spunem noua valoare înainte de încărcare, iar tu decizi dacă mergi mai departe.
      </p>

      <h2>4. Timpul de sosire</h2>
      <p>
        Timpul de sosire depinde de zonă, de trafic și de locul de unde pleacă cea mai apropiată platformă disponibilă în acel moment. Îl estimăm la telefon,
        la confirmarea comenzii. Este o estimare, nu un termen garantat; dacă apare o întârziere, te anunțăm.
      </p>

      <h2>5. Prețul</h2>
      <ul>
        <li>Calculatorul de pe site oferă un preț estimativ, calculat după tipul vehiculului și distanța pe drum, conform <Link className="link" href="/tarife-tractari/">tarifelor publicate</Link>. Prețul final este cel confirmat la telefon înainte de plecarea platformei.</li>
        <li>Pentru curse lungi se aplică tariful pe kilometru (primii {PRICING.extraKm} km cu tariful Extra-City, restul cu tariful Intra-City), cu coeficientul tarifar ×{PRICING.multiplier.toLocaleString("ro-RO")}.</li>
        <li>Pentru curse scurte (până la {PRICING.shortMaxKm} km) se adaugă taxa de încărcare și taxa de descărcare, după tipul vehiculului.</li>
        <li>Staționarea: primele {PRICING.freeWaitMinutes} de minute la încărcare și la descărcare sunt gratuite; după aceea se plătesc {PRICING.waitPerHour} lei pe oră.</li>
        <li>Vehiculele cu roți blocate sau avariate necesită echipament suplimentar; suplimentul se comunică la telefon, înainte de confirmare.</li>
      </ul>

      <h2>6. Plata</h2>
      <p>Plata se face în lei, prin una dintre metodele:</p>
      <ul>
        <li><strong>numerar (cash)</strong>, la finalul transportului;</li>
        <li><strong>transfer bancar</strong>, în contul comunicat la confirmarea comenzii, înainte sau după transport, după cum stabilim.</li>
      </ul>
      <p>Pentru plată primești documentul fiscal corespunzător. Factura se emite pe persoană fizică sau juridică, la cerere.</p>

      <h2>7. Documente</h2>
      <p>La preluarea vehiculului trebuie să ai:</p>
      <ul>
        {DOCUMENTS.map((d) => <li key={d.title}>{d.title}{d.note ? ` (${d.note.toLowerCase().replace(/\.$/, "")})` : ""};</li>)}
      </ul>
      <p>Transportatorul poate refuza preluarea unui vehicul pentru care nu se poate dovedi dreptul de a dispune de el.</p>

      <h2>8. Obligațiile tale</h2>
      <ul>
        <li>să fii prezent (sau să desemnezi o persoană) la preluare și la predare;</li>
        <li>să scoți din vehicul obiectele de valoare; transportatorul nu răspunde pentru bunurile lăsate în vehicul și nedeclarate;</li>
        <li>să declari defectele cunoscute (scurgeri de lichide, frână de mână blocată, cutie automată care nu se poate decupla etc.);</li>
        <li>să plătești prețul convenit.</li>
      </ul>

      <h2>9. Obligațiile noastre și ale transportatorului</h2>
      <ul>
        <li>Dispeceratul transmite corect comanda, prețul și datele de contact către transportatorul partener și te ține la curent cu sosirea platformei.</li>
        <li>Transportatorul încarcă, asigură și transportă vehiculul cu grijă, cu echipament adecvat, și îl predă la adresa stabilită.</li>
        <li>Înainte de încărcare, starea vehiculului se verifică împreună, iar avariile existente se notează sau se fotografiază.</li>
      </ul>

      <h2>10. Răspunderea</h2>
      <p>
        Transportatorul partener răspunde, potrivit Codului civil, pentru prejudiciile cauzate vehiculului în timpul încărcării, transportului și descărcării, în
        limitele legii și ale asigurării sale. Dispeceratul răspunde pentru îndeplinirea propriilor obligații (preluarea și transmiterea comenzii, comunicarea
        prețului) și te ajută să ții legătura cu transportatorul în cazul unei reclamații.
      </p>
      <p>
        Verifică vehiculul la predare. Orice daună constatată se menționează pe loc, în prezența șoferului, și se fotografiază. Nu răspundem pentru avariile
        existente înainte de încărcare, pentru defecte mecanice preexistente sau pentru bunurile lăsate în vehicul.
      </p>
      <p>Nicio prevedere din acești termeni nu limitează drepturile pe care le ai, ca și consumator, potrivit legii.</p>

      <h2>11. Anularea comenzii</h2>
      <ul>
        <li>Poți anula gratuit comanda până la plecarea platformei spre tine.</li>
        <li>Dacă platforma a plecat deja, poate fi datorat un cost de deplasare, numai dacă ți l-am comunicat la confirmarea comenzii.</li>
        <li>Dacă nu putem trimite o platformă în timpul estimat, te anunțăm și poți anula fără niciun cost.</li>
      </ul>
      <p>
        Comanda fiind făcută la distanță, te informăm că, potrivit OUG nr. 34/2014, dreptul de retragere nu se mai aplică după ce serviciul a fost prestat integral
        cu acordul tău expres, și nici serviciilor de transport de bunuri cu dată de executare stabilită.
      </p>

      <h2>12. Forța majoră</h2>
      <p>Nicio parte nu răspunde pentru neexecutarea cauzată de forța majoră (de exemplu, condiții meteo extreme, drumuri închise de autorități, calamități), în condițiile legii.</p>

      <h2>13. Date personale</h2>
      <p>
        Pentru a executa comanda folosim numele, telefonul și adresele de preluare și de livrare, pe care le transmitem transportatorului partener. Detaliile sunt
        în <Link className="link" href="/politica-de-confidentialitate/">Politica de confidențialitate</Link>.
      </p>

      <h2>14. Reclamații și litigii</h2>
      <p>
        Ne poți trimite orice reclamație la <a className="link" href={`tel:${site.phone}`}>{site.phoneDisplay}</a>, pe WhatsApp
        {site.email ? <> sau la <a className="link" href={`mailto:${site.email}`}>{site.email}</a></> : null}, sau prin poștă la sediul firmei. Îți răspundem în cel mult 30 de zile.
      </p>
      <p>
        Dacă nu ești mulțumit de răspuns, te poți adresa Autorității Naționale pentru Protecția Consumatorilor (<a className="link" href="https://anpc.ro/" rel="noopener">anpc.ro</a>)
        sau poți apela la procedura de soluționare alternativă a litigiilor (<a className="link" href="https://anpc.ro/ce-este-sal/" rel="noopener">SAL</a>).
      </p>
      <p>Acești termeni sunt guvernați de legea română. Litigiile care nu se rezolvă amiabil se soluționează de instanțele competente din România.</p>

      <h2>15. Modificarea termenilor</h2>
      <p>Putem actualiza acești termeni; versiunea aplicabilă unei comenzi este cea publicată pe site la data confirmării ei.</p>
    </LegalPage>
  );
}

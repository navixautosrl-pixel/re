import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ogImages } from "@/lib/basePath";
import { companyDetails, siteConfig } from "@/lib/constants";

const TITLE = "Termeni și condiții";
const DESCRIPTION =
  "Condițiile în care CreareWebsitePro livrează servicii de creare website, magazine online, SEO și marketing digital: comandă, plată, termene, drepturi de autor, retragere.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: { title: `${TITLE} — ${siteConfig.name}`, description: DESCRIPTION, url: "/terms", images: ogImages },
  // Paginile legale nu aduc trafic și diluează relevanța pe cuvintele cheie
  // comerciale, dar trebuie să fie accesibile — deci nu se indexează, însă
  // linkurile din ele se urmăresc.
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={TITLE}
      intro="Documentul de față stabilește condițiile în care contractăm și livrăm serviciile prezentate pe acest site. Prin trimiterea unei solicitări sau prin acceptarea unei oferte, confirmi că ai citit și ești de acord cu ele."
      updated="2026-09-24"
    >
      <LegalSection n={1} title="Cine suntem">
        <p>
          Serviciile de pe acest site sunt furnizate de <strong>{companyDetails.legalName}</strong>, cu sediul în{" "}
          {companyDetails.address}, înregistrată la Registrul Comerțului sub nr. {companyDetails.regCom}, cod unic de
          înregistrare {companyDetails.cui} (denumită în continuare „Prestatorul”, „noi”).
        </p>
        <dl>
          <dt>Site</dt>
          <dd>{siteConfig.domain}</dd>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </dd>
          <dt>Telefon</dt>
          <dd>
            <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phone}</a>
          </dd>
          <dt>Cont bancar</dt>
          <dd>
            {companyDetails.iban} — {companyDetails.bank}
          </dd>
        </dl>
      </LegalSection>

      <LegalSection n={2} title="Definiții">
        <ul>
          <li>
            <strong>Client</strong> — persoana fizică sau juridică ce solicită sau achiziționează unul dintre
            serviciile prezentate pe site.
          </li>
          <li>
            <strong>Servicii</strong> — creare website, magazin online, optimizare SEO, marketing digital și
            mentenanță, așa cum sunt descrise pe site și detaliate în oferta transmisă.
          </li>
          <li>
            <strong>Ofertă</strong> — documentul transmis de Prestator care descrie lucrarea, prețul, termenul și
            livrabilele convenite pentru un proiect anume.
          </li>
          <li>
            <strong>Livrabil</strong> — rezultatul lucrării predat Clientului: site-ul publicat, fișierele sursă,
            documentația și orice alt material convenit în ofertă.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Serviciile și cum se încheie contractul">
        <p>
          Prețurile și pachetele afișate pe site sunt <strong>orientative</strong> și au rol informativ. Ele nu
          constituie o ofertă fermă în sensul art. 1188 Cod civil.
        </p>
        <p>
          Contractul se încheie în momentul în care Clientul acceptă în scris (email sau document semnat) oferta
          transmisă de Prestator. Oferta conține obligatoriu: descrierea lucrării, prețul final, termenul de livrare,
          numărul de runde de modificări incluse și condițiile de plată.
        </p>
        <p>
          Orice element care nu este menționat explicit în ofertă nu face parte din contract. Conținutul (texte,
          fotografii, logo, date despre firmă) este furnizat de Client, dacă nu s-a convenit altfel în scris.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Prețuri și plată">
        <p>
          Prețul convenit este cel din ofertă. Dacă Prestatorul este plătitor de TVA, prețul se comunică explicit cu
          sau fără TVA în ofertă și pe factură.
        </p>
        <p>Dacă în ofertă nu se prevede altfel, plata se face astfel:</p>
        <ul>
          <li>
            <strong>50% avans</strong> la acceptarea ofertei — lucrarea începe după confirmarea încasării;
          </li>
          <li>
            <strong>50% la finalizare</strong>, înainte de publicarea site-ului pe domeniul Clientului.
          </li>
        </ul>
        <p>
          Metode de plată acceptate: card bancar (Visa, Mastercard), transfer bancar, PayPal și criptomonede. Nu
          acceptăm plata în numerar sau ramburs. La plata în criptomonede, cursul de schimb este cel din momentul
          emiterii facturii, iar eventualele comisioane de rețea sunt suportate de Client.
        </p>
        <p>
          Pentru fiecare plată se emite factură. Întârzierea la plată cu mai mult de 15 zile calendaristice de la
          scadență dă dreptul Prestatorului să suspende lucrarea și accesul la livrabile până la achitarea sumelor
          datorate.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Termene de livrare">
        <p>
          Termenul de livrare se stabilește în ofertă și curge de la data la care sunt îndeplinite{" "}
          <strong>ambele</strong> condiții: avansul a fost încasat și Clientul a pus la dispoziție conținutul necesar
          (texte, imagini, acces la domeniu și hosting).
        </p>
        <p>
          Întârzierile cauzate de netransmiterea conținutului, de lipsa răspunsului la solicitări sau de schimbarea
          cerințelor pe parcurs prelungesc corespunzător termenul de livrare, fără a constitui o neîndeplinire a
          obligațiilor Prestatorului.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Modificări și recepția lucrării">
        <p>
          Fiecare pachet include un număr de runde de modificări, precizat în ofertă. O rundă înseamnă o listă unitară
          de observații, transmisă o singură dată. Modificările care depășesc numărul inclus sau care schimbă
          substanțial cerințele inițiale se tarifează separat, pe baza unei oferte suplimentare acceptate în prealabil.
        </p>
        <p>
          Clientul are la dispoziție 7 zile calendaristice de la anunțul de finalizare pentru a transmite observații.
          În lipsa unui răspuns în acest interval, lucrarea se consideră recepționată.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Obligațiile Clientului">
        <ul>
          <li>să transmită conținutul și informațiile necesare, complete și în termenele convenite;</li>
          <li>
            să dețină drepturile asupra materialelor furnizate (texte, imagini, logo, fonturi) și să răspundă pentru
            orice pretenție a unui terț legată de acestea;
          </li>
          <li>
            să păstreze în siguranță datele de acces primite și să nu le comunice unor terți neautorizați;
          </li>
          <li>
            să folosească site-ul livrat cu respectarea legislației aplicabile, inclusiv a obligațiilor privind
            informarea consumatorilor și protecția datelor.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={8} title="Drepturi de proprietate intelectuală">
        <p>
          După achitarea integrală a prețului, Clientul dobândește dreptul de utilizare nelimitată în timp asupra
          livrabilelor realizate special pentru proiectul său: design, texte scrise de noi, cod sursă și configurări.
        </p>
        <p>
          Rămân în proprietatea Prestatorului sau a terților, iar Clientul primește doar dreptul de utilizare în cadrul
          proiectului: componentele reutilizabile din biblioteca internă a Prestatorului, bibliotecile open-source
          (folosite conform licențelor lor), fonturile și imaginile de stoc licențiate.
        </p>
        <p>
          Până la achitarea integrală, Prestatorul rămâne titularul drepturilor asupra livrabilelor. Prestatorul poate
          prezenta lucrarea în portofoliul propriu, cu excepția cazului în care Clientul solicită în scris contrariul.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Garanție și mentenanță">
        <p>
          Timp de <strong>30 de zile</strong> de la recepție, remediem gratuit erorile de funcționare care ne sunt
          imputabile. Garanția nu acoperă: modificările făcute de Client sau de terți, incompatibilitățile apărute
          după actualizarea unor servicii externe, problemele de găzduire și solicitările de funcționalități noi.
        </p>
        <p>
          Mentenanța ulterioară (actualizări, backup, monitorizare, modificări de conținut) se contractează separat, în
          condițiile stabilite de comun acord.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Dreptul de retragere (consumatori)">
        <p>
          Clientul persoană fizică ce acționează în scopuri din afara activității sale comerciale are, potrivit OUG nr.
          34/2014, dreptul de a se retrage din contract în termen de <strong>14 zile</strong> de la încheierea
          acestuia, fără a invoca vreun motiv.
        </p>
        <p>
          Dacă solicită expres începerea prestării serviciului înainte de expirarea acestui termen, Clientul datorează
          contravaloarea lucrărilor efectuate până la momentul retragerii. După executarea completă a serviciului,
          începută cu acordul său expres, dreptul de retragere se stinge.
        </p>
        <p>
          Retragerea se comunică la <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Sumele datorate se
          restituie în cel mult 14 zile de la primirea notificării, prin aceeași metodă folosită la plată.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Limitarea răspunderii">
        <p>
          Prestatorul răspunde pentru conformitatea livrabilelor cu cele descrise în ofertă. Răspunderea totală nu
          depășește valoarea sumelor efectiv încasate pentru proiectul în cauză.
        </p>
        <p>
          Prestatorul nu răspunde pentru: pierderi de profit sau de oportunitate, poziționarea în rezultatele motoarelor
          de căutare (algoritmii nu sunt sub controlul nostru și nu garantăm o anumită poziție), indisponibilitatea
          serviciilor terțe (găzduire, domenii, procesatori de plăți, rețele sociale) și consecințele modificărilor
          făcute de Client sau de terți asupra site-ului după livrare.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Forță majoră">
        <p>
          Niciuna dintre părți nu răspunde pentru neexecutarea obligațiilor cauzată de un eveniment de forță majoră,
          în sensul art. 1351 Cod civil. Partea afectată notifică cealaltă parte în cel mult 5 zile de la apariția
          evenimentului.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Protecția datelor personale">
        <p>
          Prelucrăm datele personale conform Regulamentului (UE) 2016/679 (GDPR). Detaliile — ce date colectăm, pe ce
          temei, cât le păstrăm și ce drepturi ai — sunt în <a href="/privacy">Politica de confidențialitate</a>, iar
          cele despre cookie-uri în <a href="/cookies">Politica de cookie-uri</a>.
        </p>
      </LegalSection>

      <LegalSection n={14} title="Soluționarea litigiilor">
        <p>
          Încercăm să rezolvăm orice reclamație direct, pe email sau telefon. Dacă nu ajungem la o soluție, Clientul
          consumator se poate adresa:
        </p>
        <ul>
          <li>
            Autorității Naționale pentru Protecția Consumatorilor —{" "}
            <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">
              anpc.ro
            </a>
            , inclusiv procedurii de soluționare alternativă a litigiilor (SAL):{" "}
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer">
              anpc.ro/ce-este-sal
            </a>
            ;
          </li>
          <li>
            platformei europene de soluționare online a litigiilor (SOL):{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              ec.europa.eu/consumers/odr
            </a>
            .
          </li>
        </ul>
        <p>
          Litigiile nesoluționate pe cale amiabilă sunt de competența instanțelor române, conform legislației în
          vigoare.
        </p>
      </LegalSection>

      <LegalSection n={15} title="Modificarea termenilor">
        <p>
          Putem actualiza acest document. Versiunea aplicabilă unui proiect este cea publicată la data acceptării
          ofertei. Data ultimei actualizări este afișată în partea de sus a paginii.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ogImages } from "@/lib/basePath";
import { companyDetails, siteConfig } from "@/lib/constants";

const TITLE = "Politica de confidențialitate";
const DESCRIPTION =
  "Ce date personale prelucrează CreareWebsitePro, pe ce temei legal, cât timp le păstrăm și ce drepturi ai conform GDPR.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { title: `${TITLE} — ${siteConfig.name}`, description: DESCRIPTION, url: "/privacy", images: ogImages },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={TITLE}
      intro="Prelucrăm cât mai puține date, pentru scopuri pe care le putem explica într-o frază. Mai jos scrie exact ce colectăm, de ce, cât timp păstrăm și ce poți cere să facem cu datele tale."
      updated="2026-09-24"
    >
      <LegalSection n={1} title="Cine este operatorul de date">
        <p>
          Operatorul datelor tale personale este <strong>{companyDetails.legalName}</strong>, {companyDetails.address},
          CUI {companyDetails.cui}, înregistrată la Registrul Comerțului sub nr. {companyDetails.regCom}.
        </p>
        <dl>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </dd>
          <dt>Telefon</dt>
          <dd>
            <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phone}</a>
          </dd>
        </dl>
        <p>
          Pentru orice întrebare legată de datele tale, scrie-ne la adresa de mai sus cu subiectul „GDPR”. Răspundem în
          cel mult 30 de zile.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Ce date colectăm și de unde">
        <p>
          <strong>Date pe care ni le dai tu.</strong> Când completezi formularul de contact sau ne scrii pe email,
          WhatsApp ori în chatul de pe site: nume, adresă de email, număr de telefon, denumirea firmei (opțional), tipul de proiect, bugetul
          estimat și mesajul tău. Formularul de pe site nu are un server propriu: la trimitere, datele completate ne
          sunt livrate ca mesaj pe WhatsApp, printr-un serviciu extern (CallMeBot). Nu se salvează nimic pe acest
          site.
        </p>
        <p>
          <strong>Date colectate automat.</strong> Serverul pe care este găzduit site-ul înregistrează, ca orice server
          web, adresa IP, tipul de browser, pagina accesată și momentul accesării. Aceste jurnale servesc exclusiv la
          funcționarea și securitatea site-ului.
        </p>
        <p>
          <strong>Ce nu colectăm.</strong> Nu cerem date din categorii speciale (sănătate, convingeri, date biometrice),
          nu cumpărăm baze de date și nu facem profilare automată cu efecte juridice asupra ta.
        </p>
      </LegalSection>

      <LegalSection n={3} title="De ce le prelucrăm și pe ce temei">
        <ul>
          <li>
            <strong>Ca să răspundem solicitării tale și să îți trimitem o ofertă</strong> — temei: demersuri
            precontractuale la cererea ta, art. 6(1)(b) GDPR.
          </li>
          <li>
            <strong>Ca să executăm contractul și să emitem facturi</strong> — temei: executarea contractului, art.
            6(1)(b), și obligații legale contabile și fiscale, art. 6(1)(c).
          </li>
          <li>
            <strong>Ca să menținem site-ul funcțional și în siguranță</strong> — temei: interesul nostru legitim de a
            preveni abuzurile și de a asigura disponibilitatea serviciului, art. 6(1)(f).
          </li>
          <li>
            <strong>Ca să măsurăm traficul cu instrumente de analiză</strong>, dacă și când vor fi activate — temei:
            consimțământul tău, art. 6(1)(a), exprimat din bannerul de cookie-uri și retractabil oricând.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Cât timp păstrăm datele">
        <ul>
          <li>
            <strong>Solicitări care nu devin proiecte</strong> — maximum 12 luni de la ultima comunicare, apoi se
            șterg.
          </li>
          <li>
            <strong>Corespondență și documente de proiect</strong> — pe durata colaborării și 3 ani după finalizare
            (termenul general de prescripție).
          </li>
          <li>
            <strong>Facturi și documente contabile</strong> — 10 ani, termen impus de legislația contabilă.
          </li>
          <li>
            <strong>Jurnalele serverului</strong> — perioada stabilită de furnizorul de găzduire, de regulă sub 12
            luni.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Cu cine împărtășim datele">
        <p>Nu vindem și nu închiriem date personale. Le pot prelucra, strict pentru scopurile de mai sus:</p>
        <ul>
          <li>
            <strong>furnizorul de găzduire</strong> al acestui site (
            <a href={siteConfig.robixHostUrl} target="_blank" rel="noopener noreferrer">
              RobixHost
            </a>
            ), care operează serverul și jurnalele acestuia;
          </li>
          <li>
            <strong>furnizorul serviciului de email</strong> prin care primim mesajele tale;
          </li>
          <li>
            <strong>CallMeBot</strong>, serviciul prin care mesajul din formularul de contact ne este livrat pe
            WhatsApp — primește conținutul completat de tine;
          </li>
          <li>
            <strong>Tawk.to</strong>, furnizorul chatului de pe site — primește adresa ta IP la fiecare vizită și
            conținutul discuției, dacă scrii în chat. Detalii în{" "}
            <a href="/cookies">Politica de cookie-uri</a> și în{" "}
            <a href="https://www.tawk.to/privacy-policy/" target="_blank" rel="noopener noreferrer">
              politica lor de confidențialitate
            </a>
            ;
          </li>
          <li>
            <strong>contabilul și, după caz, procesatorul de plăți</strong>, pentru facturare și încasări;
          </li>
          <li>
            <strong>autoritățile publice</strong>, atunci când legea ne obligă să răspundem unei solicitări.
          </li>
        </ul>
        <p>
          Furnizorii de servicii prelucrează datele în calitate de persoane împuternicite, pe baza unor contracte care
          îi obligă la confidențialitate și securitate.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Transferuri în afara Uniunii Europene">
        <p>
          Prelucrarea are loc, de regulă, în Spațiul Economic European. Dacă un furnizor folosește infrastructură din
          afara SEE, transferul are loc doar pe baza unei decizii de adecvare a Comisiei Europene sau a clauzelor
          contractuale standard, conform art. 44–49 GDPR.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Drepturile tale">
        <p>Conform GDPR, ai dreptul:</p>
        <ul>
          <li>de acces — să afli ce date avem despre tine și să primești o copie;</li>
          <li>la rectificare — să corectăm datele inexacte sau incomplete;</li>
          <li>la ștergere — „dreptul de a fi uitat”, când nu mai există temei pentru prelucrare;</li>
          <li>la restricționarea prelucrării, în cazurile prevăzute de lege;</li>
          <li>la portabilitate — să primești datele într-un format structurat, citibil automat;</li>
          <li>
            de opoziție — să te opui prelucrărilor bazate pe interesul nostru legitim, inclusiv marketingului direct;
          </li>
          <li>de a-ți retrage consimțământul oricând, fără a afecta prelucrările de dinainte de retragere.</li>
        </ul>
        <p>
          Îți exerciți aceste drepturi scriindu-ne la <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          Dacă răspunsul nostru nu te mulțumește, te poți adresa Autorității Naționale de Supraveghere a Prelucrării
          Datelor cu Caracter Personal —{" "}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
            dataprotection.ro
          </a>{" "}
          — sau instanței de judecată.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Cookie-uri">
        <p>
          Site-ul folosește un număr minim de cookie-uri. Ce sunt, care sunt strict necesare și cum îți schimbi opțiunea
          scrie în <a href="/cookies">Politica de cookie-uri</a>.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Securitate">
        <p>
          Site-ul este servit exclusiv prin HTTPS. Accesul la corespondență și la documentele de proiect este limitat la
          persoanele care lucrează efectiv la proiect. Aplicăm măsuri tehnice și organizatorice rezonabile, dar niciun
          sistem nu poate fi garantat ca fiind absolut sigur.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Modificări ale acestei politici">
        <p>
          Dacă schimbăm modul în care prelucrăm datele, actualizăm acest document și modificăm data afișată în partea de
          sus. Schimbările importante sunt anunțate și printr-un mesaj vizibil pe site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { CookieSettingsButton } from "@/components/shared/CookieConsent";
import { ogImages } from "@/lib/basePath";
import { siteConfig } from "@/lib/constants";

const TITLE = "Politica de cookie-uri";
const DESCRIPTION =
  "Ce cookie-uri folosește CreareWebsitePro, la ce servesc, cât durează și cum îți schimbi oricând opțiunea.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cookies" },
  openGraph: { title: `${TITLE} — ${siteConfig.name}`, description: DESCRIPTION, url: "/cookies", images: ogImages },
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={TITLE}
      intro="Site-ul acesta folosește foarte puține cookie-uri, iar cele care nu sunt strict necesare nu pornesc până nu le accepți tu. Mai jos scrie exact ce se salvează și pentru cât timp."
      updated="2026-09-24"
    >
      <LegalSection n={1} title="Ce sunt cookie-urile">
        <p>
          Cookie-urile sunt fișiere mici de text pe care un site le salvează în browserul tău. Ele rețin lucruri simple
          — de exemplu că ai închis un mesaj — ca să nu fie nevoie să le repeți la fiecare vizită. Alături de ele,
          browserele oferă și alte metode de stocare locală, precum stocarea locală (localStorage), folosită în același scop.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Ce folosim pe acest site">
        <p>
          <strong>Strict necesare.</strong> O singură intrare, salvată în stocarea locală a browserului sub numele{" "}
          <strong>cwp-consent</strong>, care reține alegerea ta din bannerul de cookie-uri. Fără ea, bannerul ar
          reapărea la fiecare pagină. Nu conține date personale, nu pleacă de pe dispozitivul tău și expiră după 12
          luni.
        </p>
        <p>
          <strong>Analiză de trafic.</strong> Nu sunt active în acest moment. Dacă vom adăuga un instrument de măsurare
          a traficului, el va porni <strong>numai după ce îl accepți</strong> din bannerul de cookie-uri, iar această
          pagină va fi actualizată cu numele furnizorului și durata cookie-urilor folosite.
        </p>
        <p>
          <strong>Marketing.</strong> Nu folosim cookie-uri de publicitate, remarketing sau urmărire între site-uri.
        </p>
        <p>
          <strong>Terți.</strong> Site-ul nu încarcă fonturi, hărți, videoclipuri sau butoane de rețele sociale de pe
          servere externe, deci niciun terț nu primește adresa ta IP prin simpla vizitare a paginii.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Cum îți schimbi opțiunea">
        <p>
          Poți reveni oricând asupra alegerii făcute, cu butonul de mai jos. Poți, de asemenea, să ștergi datele
          salvate de site direct din setările browserului, la secțiunea de confidențialitate și date de navigare.
        </p>
        <p>
          <CookieSettingsButton className="mt-2 inline-flex items-center rounded-full border border-accent-2/50 px-5 py-2.5 text-sm font-semibold text-accent-2 transition-colors hover:bg-accent-2/10">
            Modifică preferințele de cookie-uri
          </CookieSettingsButton>
        </p>
      </LegalSection>

      <LegalSection n={4} title="Legătura cu datele tale personale">
        <p>
          Refuzul cookie-urilor care nu sunt strict necesare nu afectează în niciun fel funcționarea site-ului. Ce se
          întâmplă cu datele pe care ni le trimiți tu, prin formular sau email, este descris în{" "}
          <a href="/privacy">Politica de confidențialitate</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

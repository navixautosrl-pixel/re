import { LegalPage } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Politica de cookie-uri", description: "Ce stochează site-ul RbtFishPro în browserul tău.", path: "/politica-cookies", noindex: true });

export default function Cookies() {
  return (
    <LegalPage title="Politica de cookie-uri" path="/politica-cookies" updated="9 octombrie 2026">
      <p>
        Site-ul nu setează cookie-uri de analiză, de publicitate sau de la terți. De aceea nu îți cerem consimțământul printr-un banner.
      </p>
      <h2>Ce stocăm în browser</h2>
      <ul>
        <li><strong>rbtfishpro.cart.v1</strong> (localStorage): produsele din coș, ca să nu le pierzi când închizi pagina. Se șterge când golești coșul sau trimiți comanda.</li>
        <li><strong>rbtfishpro.lastOrder</strong> (sessionStorage): rezumatul ultimei comenzi trimise, afișat pe pagina de confirmare. Dispare când închizi fereastra.</li>
      </ul>
      <p>Ambele sunt strict necesare pentru funcțiile pe care le folosești și nu sunt trimise către nimeni. Le poți șterge oricând din setările browserului.</p>
      <h2>Dacă se schimbă</h2>
      <p>Dacă vom adăuga instrumente de analiză sau marketing, acestea vor porni doar după ce îți dai acordul, iar această pagină va fi actualizată.</p>
    </LegalPage>
  );
}

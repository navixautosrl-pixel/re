import { LegalPage, Operator } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = { ...pageMeta({ title: "Politica de confidențialitate", description: "Ce date folosește site-ul și de ce.", path: "/politica-de-confidentialitate/" }), robots: { index: false } };

export default function Privacy() {
  return (
    <LegalPage title="Politica de confidențialitate">
      <h2>Cine suntem</h2>
      <p><Operator />.</p>
      <h2>Ce date folosește site-ul</h2>
      <ul>
        <li>Calculatorul de preț rulează în browserul tău; vehiculul și distanța nu sunt trimise către noi.</li>
        <li>Dacă folosești căutarea de adrese, textul tastat și adresele alese sunt trimise către Google (Places API și Routes API) pentru a calcula traseul. Fără căutarea de adrese, nu se face nicio cerere către Google.</li>
        <li>Butonul WhatsApp deschide aplicația WhatsApp cu un mesaj pe care îl poți modifica înainte de trimitere; datele ajung la noi doar dacă trimiți mesajul.</li>
        <li>Site-ul nu folosește cookie-uri, instrumente de analiză sau publicitate.</li>
      </ul>
      <h2>Drepturile tale</h2>
      <p>Ai dreptul de acces, rectificare, ștergere, opoziție și portabilitate, și poți depune plângere la ANSPDCP (dataprotection.ro).</p>
    </LegalPage>
  );
}

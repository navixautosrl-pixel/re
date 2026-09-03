import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Politica de confidențialitate" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Politica de confidențialitate"
      intro="Cum sunt colectate, folosite și protejate datele personale pe robixhost.ro."
      sections={[
        { heading: "1. Operatorul de date", note: "Identitatea legală completă a RobixHost ca operator de date (vezi și footer)." },
        {
          heading: "2. Ce date colectăm pe acest site",
          note: "Acest site (robixhost.ro) este static și nu are cont propriu sau formulare — nu colectează și nu stochează date de identificare. Adresa IP afișată în secvența de introducere este obținută direct de browser-ul tău de la un serviciu public (ipify.org), doar pentru afișare, și nu este trimisă către sau păstrată de RobixHost. Contul de client, comenzile și tichetele de suport sunt gestionate separat, în platforma de facturare de la clienti.robixhost.ro, care are propriile măsuri de confidențialitate.",
        },
        { heading: "3. Scopul procesării", note: "De ce sunt colectate datele — livrarea serviciului, securitate (protecție DDoS), comunicare cu clientul, în contul de client." },
        { heading: "4. Temeiul legal", note: "Temeiul GDPR pentru fiecare tip de procesare (executarea contractului, interes legitim, consimțământ)." },
        { heading: "5. Destinatari și împuterniciți", note: "Procesatori terți implicați (ex: procesator de plăți, furnizor de infrastructură) — de listat după confirmare." },
        { heading: "6. Durata stocării", note: "Cât timp sunt păstrate diferitele categorii de date." },
        { heading: "7. Drepturile persoanei vizate", note: "Acces, rectificare, ștergere, restricționare, portabilitate, opoziție — și cum pot fi exercitate (vezi și pagina GDPR)." },
        { heading: "8. Transferuri internaționale", note: "Dacă datele sunt transferate în afara SEE și ce garanții se aplică." },
        { heading: "9. Securitatea datelor", note: "Măsurile tehnice și organizatorice folosite pentru protejarea datelor." },
        { heading: "10. Modificări ale politicii", note: "Cum sunt comunicate actualizările acestei politici." },
        { heading: "11. Contact", note: "Datele de contact pentru solicitări privind confidențialitatea." },
      ]}
    />
  );
}

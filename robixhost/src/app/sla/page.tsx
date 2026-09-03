import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "SLA — Acord de Nivel de Serviciu" };

export default function SlaPage() {
  return (
    <LegalPageLayout
      title="SLA — Acord de nivel de serviciu"
      intro="Angajamentele RobixHost privind disponibilitatea serviciilor și procesul în caz de nerespectare."
      sections={[
        { heading: "1. Obiectul SLA", note: "Ce servicii sunt acoperite de acest acord (Web Hosting, VPS, Dedicated Servers etc.)." },
        { heading: "2. Nivelul de disponibilitate garantat", note: "Procentul de uptime garantat — nu este stabilit încă; nu se afișează public un procent fără confirmare." },
        { heading: "3. Definirea downtime-ului", note: "Ce se consideră indisponibilitate în scopul acestui acord (și ce nu se consideră)." },
        { heading: "4. Compensații pentru nerespectare", note: "Cum este compensat clientul dacă nivelul garantat nu este atins (credit de serviciu etc.)." },
        { heading: "5. Excluderi", note: "Mentenanță planificată (anunțată în avans), forță majoră, probleme cauzate de client." },
        { heading: "6. Procesul de raportare a unui incident", note: "Cum raportează clientul o problemă de disponibilitate și cum este documentată." },
        { heading: "7. Contact suport SLA", note: "Canalul dedicat pentru solicitări legate de SLA." },
      ]}
    />
  );
}

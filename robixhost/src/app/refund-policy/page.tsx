import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Politica de rambursare" };

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Politica de rambursare"
      intro="Condițiile în care un client poate solicita rambursarea unui serviciu RobixHost."
      sections={[
        { heading: "1. Eligibilitate pentru rambursare", note: "Ce servicii sunt eligibile pentru rambursare și în ce condiții." },
        { heading: "2. Perioada de garanție (money-back)", note: "Numărul de zile în care se poate solicita rambursarea integrală, dacă există o astfel de politică." },
        { heading: "3. Excluderi", note: "Servicii neeligibile pentru rambursare — de regulă domenii înregistrate, licențe activate, taxe de configurare." },
        { heading: "4. Procesul de solicitare", note: "Pașii pentru a depune o cerere de rambursare." },
        { heading: "5. Termen de procesare", note: "Durata estimată de procesare a unei rambursări aprobate." },
        { heading: "6. Metoda de rambursare", note: "Cum este returnată suma (aceeași metodă de plată folosită la achiziție etc.)." },
      ]}
    />
  );
}

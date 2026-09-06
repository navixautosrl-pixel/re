import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Politica de confidențialitate" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Politica de confidențialitate"
      sections={[
        { heading: "1. Operatorul de date", note: "Identitatea legală completă a firmei — de completat." },
        { heading: "2. Ce date colectăm", note: "Acest site nu are formulare sau cont — nu colectează date de identificare ale vizitatorilor." },
        { heading: "3. Contact telefonic/WhatsApp", note: "Datele oferite telefonic sunt folosite doar pentru programare/ofertă." },
        { heading: "4. Drepturile tale", note: "Acces, rectificare, ștergere — contactează-ne telefonic pentru orice solicitare." },
      ]}
    />
  );
}

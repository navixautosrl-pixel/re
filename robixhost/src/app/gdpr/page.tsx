import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "GDPR" };

export default function GdprPage() {
  return (
    <LegalPageLayout
      title="GDPR"
      intro="Angajamentul RobixHost privind protecția datelor cu caracter personal, conform Regulamentului (UE) 2016/679."
      sections={[
        { heading: "1. Angajamentul RobixHost", note: "Declarație privind respectarea principiilor GDPR în operarea site-ului și serviciilor." },
        { heading: "2. Drepturile tale conform GDPR", note: "Acces, rectificare, ștergere, restricționarea procesării, portabilitate, opoziție — detaliate și în Politica de confidențialitate." },
        { heading: "3. Cum îți exerciți drepturile", note: "Procesul concret prin care un vizitator/client poate depune o solicitare GDPR." },
        { heading: "4. Autoritatea de supraveghere", note: "Datele de contact ale ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal) pentru depunerea unei plângeri." },
        { heading: "5. Măsuri de securitate", note: "Rezumatul măsurilor tehnice/organizatorice aplicate datelor personale." },
        { heading: "6. Contact pentru solicitări GDPR", note: "Persoana/departamentul responsabil de solicitările privind protecția datelor." },
      ]}
    />
  );
}

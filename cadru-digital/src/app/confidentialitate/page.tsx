import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Politica de confidențialitate" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Politica de confidențialitate"
      sections={[
        { heading: "1. Operatorul de date", note: "Identitatea legală completă a firmei — de completat." },
        {
          heading: "2. Ce date colectăm",
          note: "Prin formularul de contact colectăm numele, adresa de e-mail și, opțional, compania, telefonul și detaliile proiectului — doar datele pe care alegi să le trimiți.",
        },
        {
          heading: "3. Cum trimitem mesajul",
          note: "Formularul deschide clientul tău local de email, cu mesajul precompletat — datele ajung direct la noi prin email, nu sunt stocate pe server.",
        },
        {
          heading: "4. Scopul folosirii datelor",
          note: "Folosim datele exclusiv pentru a răspunde solicitării tale de proiect, nu le transmitem terților și nu le folosim în scop de marketing fără acordul tău explicit.",
        },
        {
          heading: "5. Drepturile tale",
          note: "Acces, rectificare, ștergere — ne poți contacta oricând prin email pentru orice solicitare privind datele tale.",
        },
      ]}
    />
  );
}

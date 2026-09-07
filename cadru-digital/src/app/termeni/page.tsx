import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Termeni și condiții" };

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Termeni și condiții"
      sections={[
        { heading: "1. Identitatea firmei", note: "Datele de identificare legală ale firmei — de completat." },
        {
          heading: "2. Serviciile oferite",
          note: "Creare de website-uri, landing page-uri, magazine online, servicii SEO, marketing digital și optimizare/mentenanță — detaliate pe pagina de servicii.",
        },
        {
          heading: "3. Colaborarea",
          note: "Fiecare proiect pornește cu o discuție de descoperire și o propunere clară de scop, termen și cost, agreată înainte de începerea lucrului.",
        },
        {
          heading: "4. Proprietate și livrare",
          note: "Condițiile de livrare, proprietate intelectuală și plată se stabilesc contractual, per proiect — de detaliat pentru fiecare colaborare.",
        },
        { heading: "5. Contact", note: "Pentru orice întrebare legată de acești termeni, ne poți scrie prin formularul de contact." },
      ]}
    />
  );
}

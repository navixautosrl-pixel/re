import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Politica de utilizare acceptabilă" };

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout
      title="Politica de utilizare acceptabilă"
      intro="Regulile de utilizare a serviciilor RobixHost, menite să protejeze infrastructura și ceilalți clienți."
      sections={[
        { heading: "1. Scopul politicii", note: "De ce există această politică și cui i se aplică." },
        { heading: "2. Activități interzise", note: "Spam, distribuție de malware, găzduire de conținut ilegal, atacuri asupra altor sisteme, phishing etc." },
        { heading: "3. Utilizarea resurselor", note: "Limite privind utilizarea excesivă a resurselor partajate (CPU, trafic, stocare) pe planurile de hosting/VPS." },
        { heading: "4. Consecințele încălcării", note: "Ce se întâmplă în cazul unei încălcări — avertisment, suspendare, încetarea contractului." },
        { heading: "5. Raportarea abuzurilor", note: "Cum poate un terț raporta un abuz observat pe infrastructura RobixHost." },
        { heading: "6. Cooperarea cu autoritățile", note: "Condițiile în care RobixHost cooperează cu autoritățile legale." },
      ]}
    />
  );
}

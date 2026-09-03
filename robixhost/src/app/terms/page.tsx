import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = { title: "Termeni și condiții" };

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Termeni și condiții"
      intro="Termenii care guvernează folosirea serviciilor RobixHost."
      sections={[
        { heading: "1. Obiectul contractului", note: "Descrierea generală a relației contractuale dintre RobixHost și client." },
        { heading: "2. Definiții", note: "Termenii cheie folosiți în document (Serviciu, Cont, Client, Furnizor etc.)." },
        { heading: "3. Crearea contului și eligibilitate", note: "Condiții pentru crearea unui cont și cine poate contracta serviciile." },
        { heading: "4. Descrierea serviciilor", note: "Web Hosting, VPS, Game Servers, Domenii, Dedicated Servers — ce include fiecare, conform paginilor de produs." },
        { heading: "5. Preț și facturare", note: "Ciclul de facturare, metodele de plată acceptate și politica pentru neplată." },
        { heading: "6. Drepturi și obligații ale clientului", note: "Ce se așteaptă de la client — inclusiv respectarea Politicii de Utilizare Acceptabilă." },
        { heading: "7. Drepturi și obligații ale RobixHost", note: "Angajamentele RobixHost față de client, inclusiv limitele acestora." },
        { heading: "8. Limitarea răspunderii", note: "Situațiile în care răspunderea RobixHost este limitată — necesită revizuire juridică atentă." },
        { heading: "9. Suspendare și încetare", note: "Condițiile în care un serviciu poate fi suspendat sau contul închis." },
        { heading: "10. Modificarea termenilor", note: "Cum și când pot fi actualizați acești termeni și cum este notificat clientul." },
        { heading: "11. Legea aplicabilă și jurisdicție", note: "Legea română/UE aplicabilă și instanța competentă." },
        { heading: "12. Contact", note: "Datele de contact pentru întrebări legate de acești termeni." },
      ]}
    />
  );
}
